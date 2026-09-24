import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { exerciseAttempts, lessonProgress, masteryResults, personalErrors, recordingMetadata, reviewCards, reviewLogs, savedSentences, userPreferences, voicePreferences } from "@/lib/db/schema";

export const runtime = "nodejs";
export async function GET() {
  const data = { version: 2, exportedAt: new Date().toISOString(), preferences: await db.select().from(userPreferences), voicePreferences: await db.select().from(voicePreferences), recordingMetadata: await db.select().from(recordingMetadata), progress: await db.select().from(lessonProgress), attempts: await db.select().from(exerciseAttempts), mastery: await db.select().from(masteryResults), reviews: await db.select().from(reviewCards), reviewLogs: await db.select().from(reviewLogs), saved: await db.select().from(savedSentences), errors: await db.select().from(personalErrors) };
  return new NextResponse(JSON.stringify(data, null, 2), { headers: { "content-type": "application/json", "content-disposition": `attachment; filename="english-learning-backup.json"` } });
}
