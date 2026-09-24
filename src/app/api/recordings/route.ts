import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/lib/db";
import { recordingMetadata } from "@/lib/db/schema";

export const runtime = "nodejs";
const cloudflarePreview = process.env.CF_PREVIEW === "1";

const create = z.object({ id: z.string().min(1), activityId: z.string().min(1), mimeType: z.string().min(1), duration: z.number().nonnegative(), retained: z.boolean() });
const update = z.object({ id: z.string().min(1), retained: z.boolean() });
const invalidInput = "Vui lòng kiểm tra nội dung đã gửi.";

export async function GET() {
  if (cloudflarePreview) return NextResponse.json({ recordings: [] });
  return NextResponse.json({ recordings: await db.select().from(recordingMetadata) });
}

export async function POST(request: Request) {
  const parsed = create.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: invalidInput }, { status: 400 });
  if (cloudflarePreview) return NextResponse.json({ ok: true, id: parsed.data.id, preview: true });
  const value = parsed.data;
  await db
    .insert(recordingMetadata)
    .values({ ...value, createdAt: new Date() })
    .onConflictDoUpdate({ target: recordingMetadata.id, set: { activityId: value.activityId, mimeType: value.mimeType, duration: value.duration, retained: value.retained, deletedAt: null } });
  return NextResponse.json({ ok: true, id: value.id });
}

export async function PATCH(request: Request) {
  const parsed = update.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: invalidInput }, { status: 400 });
  if (cloudflarePreview) return NextResponse.json({ ok: true, preview: true });
  await db.update(recordingMetadata).set({ retained: parsed.data.retained }).where(eq(recordingMetadata.id, parsed.data.id));
  return NextResponse.json({ ok: true });
}

export async function DELETE(request: Request) {
  const url = new URL(request.url);
  if (cloudflarePreview) return NextResponse.json({ ok: true, preview: true });
  if (url.searchParams.get("all") === "true") {
    await db.delete(recordingMetadata);
    return NextResponse.json({ ok: true });
  }
  const id = url.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Thiếu mã bản ghi âm cần xóa." }, { status: 400 });
  await db.delete(recordingMetadata).where(eq(recordingMetadata.id, id));
  return NextResponse.json({ ok: true });
}
