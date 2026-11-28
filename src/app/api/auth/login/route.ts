import { z } from "zod";
import { fromOtherSite, json, jsonError, needDb, readBody } from "@/lib/server/api";
import {
  attemptsThisHour,
  findUserByEmail,
  isAdminEmail,
  MAX_LOGIN_FAILS_PER_HOUR,
  normalizeEmail,
  publicViewer,
  recordAttempt,
  startSession,
  verifyPassword,
} from "@/lib/server/auth";

const body = z.object({ email: z.string().max(200), password: z.string().max(200) });
const WRONG = "Email hoặc mật khẩu không đúng.";

export async function POST(request: Request) {
  if (fromOtherSite(request)) return jsonError(403, "Forbidden");
  const db = await needDb();
  if (db instanceof Response) return db;
  const data = await readBody(request, body);
  if (!data) return jsonError(400, "Dữ liệu không hợp lệ.");
  const email = normalizeEmail(data.email);
  const key = `login:${email}`;
  if ((await attemptsThisHour(db, key)) >= MAX_LOGIN_FAILS_PER_HOUR) {
    return jsonError(429, "Nhập sai quá nhiều lần. Thử lại sau một giờ nhé.");
  }

  const user = await findUserByEmail(db, email);
  if (!user || !(await verifyPassword(data.password, user.password_hash, user.password_salt))) {
    await recordAttempt(db, key);
    return jsonError(401, WRONG);
  }
  if (user.status !== "active") return jsonError(403, "Tài khoản này đang bị khóa. Liên hệ quản trị viên.");

  // An address added to ADMIN_EMAILS later becomes administrator at its next sign-in.
  const role = user.role === "admin" || isAdminEmail(email) ? "admin" : "member";
  await db.prepare("UPDATE users SET last_login_at = ?, role = ? WHERE id = ?").bind(new Date().toISOString(), role, user.id).run();
  await startSession(db, user.id);
  const { password_hash: _h, password_salt: _s, ...safe } = user;
  void _h;
  void _s;
  return json(publicViewer({ kind: role, user: { ...safe, role } }));
}
