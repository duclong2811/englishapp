import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { branchingProgress, listeningAttempts, recordingMetadata, shadowingAttempts, voicePreferences } from "@/lib/db/schema";

export const runtime = "nodejs";

const payload = z.discriminatedUnion("type", [
  z.object({ type: z.literal("voice-preferences"), usVoiceUri: z.string().nullable(), ukVoiceUri: z.string().nullable(), koVoiceUri: z.string().nullable(), rate: z.number().min(0.5).max(1.25) }),
  z.object({ type: z.literal("recording"), id: z.string(), activityId: z.string(), mimeType: z.string(), duration: z.number().nonnegative(), retained: z.boolean().default(false) }),
  z.object({ type: z.literal("shadowing"), lineId: z.string(), recordingId: z.string().optional(), rating: z.enum(["Again", "Hard", "Good", "Easy"]), retained: z.boolean() }),
  z.object({ type: z.literal("listening"), exerciseId: z.string(), response: z.string(), score: z.number().min(0).max(1) }),
  z.object({ type: z.literal("branching"), scenarioId: z.string(), nodeId: z.string(), history: z.array(z.unknown()), outcome: z.string().optional() }),
]);

export async function POST(request: Request) {
  const parsed = payload.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Vui lòng kiểm tra nội dung đã gửi." }, { status: 400 });
  const value = parsed.data;
  const now = new Date();
  if (value.type === "voice-preferences") await db.insert(voicePreferences).values({ id: 1, ...value }).onConflictDoUpdate({ target: voicePreferences.id, set: value });
  if (value.type === "recording") await db.insert(recordingMetadata).values({ ...value, createdAt: now });
  if (value.type === "shadowing") await db.insert(shadowingAttempts).values({ ...value, createdAt: now });
  if (value.type === "listening") await db.insert(listeningAttempts).values({ ...value, createdAt: now });
  if (value.type === "branching")
    await db
      .insert(branchingProgress)
      .values({ ...value, updatedAt: now })
      .onConflictDoUpdate({ target: branchingProgress.scenarioId, set: { nodeId: value.nodeId, history: value.history, outcome: value.outcome, updatedAt: now } });
  return NextResponse.json({ ok: true });
}
