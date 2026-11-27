"use client";

import { createScoreStore } from "@/lib/local-scores";

/** Best exercise score (%) per grammar lesson, stored on this device. */
// One store for every level: lesson ids are unique, and renaming the key would lose saved scores.
export const grammarScores = createScoreStore("grammar:a1:v1");
