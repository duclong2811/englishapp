import { fromOtherSite, json, jsonError } from "@/lib/server/api";
import { endSession } from "@/lib/server/auth";
import { getDb } from "@/lib/server/db";

export async function POST(request: Request) {
  if (fromOtherSite(request)) return jsonError(403, "Forbidden");
  const db = await getDb();
  if (db) await endSession(db);
  return json({ ok: true });
}
