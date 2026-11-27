"use client";

import { createScoreStore } from "@/lib/local-scores";

/** Best exercise score (%) per grammar lesson, stored on this device. */
export const grammarScores = createScoreStore("grammar:a1:v1");
