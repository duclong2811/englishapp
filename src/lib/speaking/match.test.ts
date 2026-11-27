import { describe, expect, it } from "vitest";
import { compareSpeech, normalize } from "./match";

describe("normalize", () => {
  it("evens out contractions, numbers and times", () => {
    expect(normalize("I'm fine, thanks!")).toEqual(["i", "am", "fine", "thanks"]);
    expect(normalize("I get up at 6 a.m.")).toEqual(["i", "get", "up", "at", "six", "am"]);
    expect(normalize("It's seven o'clock.")).toEqual(normalize("It is 7 o'clock"));
    expect(normalize("It costs $25.")).toEqual(["it", "costs", "twenty", "five", "dollars"]);
    expect(normalize("I don't know")).toEqual(["i", "do", "not", "know"]);
  });
});

describe("compareSpeech", () => {
  it("gives full marks for the same words with different punctuation", () => {
    const r = compareSpeech("Can I have a coffee, please?", "can i have a coffee please");
    expect(r.score).toBe(1);
    expect(r.words.every((w) => w.ok)).toBe(true);
  });

  it("marks missing words", () => {
    const r = compareSpeech("I have two brothers and a sister.", "I have two brother and sister");
    expect(r.words.map((w) => w.ok)).toEqual([true, true, true, false, true, false, true]);
    expect(r.score).toBeCloseTo(5 / 7);
  });

  it("accepts I am for I'm", () => {
    expect(compareSpeech("I'm from Hanoi.", "I am from Hanoi").score).toBe(1);
  });
});
