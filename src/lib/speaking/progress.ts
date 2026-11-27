"use client";

import { createScoreStore } from "@/lib/local-scores";

/** Best score per speaking lesson, stored on this device. */
const store = createScoreStore("speak:lessons:v1");

export const subscribe = store.subscribe;
export const getSnapshot = store.getSnapshot;
export const getServerSnapshot = store.getServerSnapshot;
export const saveScore = store.save;
