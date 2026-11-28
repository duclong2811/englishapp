import { z } from "zod";
import { fromOtherSite, json, jsonError, needDb, readBody } from "@/lib/server/api";
import {
  attemptsThisHour,
  clientIp,
  findUserByEmail,
  hashPassword,
  isAdminEmail,
  MAX_SIGNUPS_PER_HOUR,
  normalizeEmail,
  PASSWORD_MIN,
  publicViewer,
  recordAttempt,
  startSession,
  validEmail,
} from "@/lib/server/auth";

const body = z.object({
  email: z.string().max(200),
  password: z.string().max(200),
  name: z.string().trim().max(60).default(""),
});

export async function POST(request: Request) {
  if (fromOtherSite(request)) return jsonError(403, "Forbidden");
  const db = await needDb();
  if (db instanceof Response) return db;
  const data = await readBody(request, body);
  if (!data) return jsonError(400, "Dữ liệu không hợp lệ.");
  const email = normalizeEmail(data.email);
  if (!validEmail(email)) return jsonError(400, "Email không hợp lệ.");
  if (data.password.length < PASSWORD_MIN) return jsonError(400, `Mật khẩu cần ít nhất ${PASSWORD_MIN} ký tự.`);

  const ipKey = `signup:${clientIp(request)}`;
  if ((await attemptsThisHour(db, ipKey)) >= MAX_SIGNUPS_PER_HOUR) {
    return jsonError(429, "Bạn đã tạo nhiều tài khoản trong giờ này. Thử lại sau nhé.");
  }
  if (await findUserByEmail(db, email)) return jsonError(409, "Email này đã có tài khoản. Hãy đăng nhập.");

  const { hash, salt } = await hashPassword(data.password);
  const now = new Date().toISOString();
  const role = isAdminEmail(email) ? "admin" : "member";
  await db
    .prepare("INSERT INTO users (email, name, password_hash, password_salt, role, status, created_at, last_login_at) VALUES (?, ?, ?, ?, ?, 'active', ?, ?)")
    .bind(email, data.name, hash, salt, role, now, now)
    .run();
  await recordAttempt(db, ipKey);
  const user = (await findUserByEmail(db, email))!;
  await startSession(db, user.id);
  return json(publicViewer({ kind: role, user }), { status: 201 });
}
