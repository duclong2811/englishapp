import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { lessonProgress, masteryResults, reviewCards, userPreferences } from "@/lib/db/schema";
import { generateReviewCards } from "@/lib/review";
import type { SkillScores } from "@/lib/exercise";
import { z } from "zod";

export const runtime = "nodejs";

const updateSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("progress"), lessonId: z.string(), status: z.string(), position: z.string(), percent: z.number().min(0).max(100) }),
  z.object({ type: z.literal("preferences"), englishLevel: z.string(), koreanLevel: z.string(), dailyMinutes: z.number(), vietnameseSupport: z.boolean(), assistMode: z.enum(["off","on-demand","always"]), explanationMode:z.enum(["both","vi","ko"]), accent: z.enum(["US", "UK"]) }),
  z.object({ type: z.literal("mastery"), lessonId: z.string(), scores: z.object({ vocabulary:z.number(), grammar:z.number(), listening:z.number(), writing:z.number(), speaking:z.number(), reading:z.number() }) }),
]);

export async function GET() {
  return NextResponse.json({ progress: await db.select().from(lessonProgress), preferences: (await db.select().from(userPreferences))[0] });
}

export async function POST(request: Request) {
  const parsed = updateSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Dữ liệu gửi lên chưa hợp lệ." }, { status: 400 });
  const value = parsed.data;
  if (value.type === "progress") {
    await db.insert(lessonProgress).values({ lessonId: value.lessonId, status: value.status, position: value.position, percent: value.percent, updatedAt: new Date() })
      .onConflictDoUpdate({ target: lessonProgress.lessonId, set: { status: value.status, position: value.position, percent: value.percent, updatedAt: new Date() } });
  } else if (value.type === "preferences") {
    await db.update(userPreferences).set(value).where(eq(userPreferences.id, 1));
  } else {
    const scores=value.scores as SkillScores;
    await db.insert(masteryResults).values({lessonId:value.lessonId,skillScores:scores,passed:true,createdAt:new Date()});
    for(const seed of generateReviewCards(value.lessonId,scores)){const card=seed.card;await db.insert(reviewCards).values({id:seed.id,objectiveId:seed.objectiveId,kind:seed.skill,due:card.due,stability:card.stability,difficulty:card.difficulty,elapsedDays:card.elapsed_days,scheduledDays:card.scheduled_days,reps:card.reps,lapses:card.lapses,state:card.state,lastReview:card.last_review}).onConflictDoUpdate({target:reviewCards.id,set:{due:card.due,stability:card.stability,difficulty:card.difficulty,elapsedDays:card.elapsed_days,scheduledDays:card.scheduled_days,reps:card.reps,lapses:card.lapses,state:card.state,lastReview:card.last_review}})}
  }
  return NextResponse.json({ ok: true });
}
