import { expect, it } from "vitest";
import { AI_RULES, MODEL_TIERS, planFor, policyLevel } from "./policy";

it("grades A1–A2 open answers without AI as the target, and B1–B2 with the standard model", () => {
  for (const f of ["write-check", "talk-check"] as const) {
    expect(AI_RULES[f].A1.tier).toBeNull();
    expect(AI_RULES[f].A2.tier).toBeNull();
    expect(AI_RULES[f].B1.tier).toBe("standard");
    expect(AI_RULES[f].B2.tier).toBe("standard");
  }
});

it("limits writing checks to 5 a day at B1 and 2 at B2", () => {
  expect(AI_RULES["write-check"].B1.daily).toBe(5);
  expect(AI_RULES["write-check"].B2.daily).toBe(2);
});

it("never plans the most expensive models by default", () => {
  for (const tier of Object.values(MODEL_TIERS)) expect(tier.model).not.toMatch(/opus|fable|mythos/);
});

it("lets the deployment swap a tier's model", () => {
  expect(planFor("write-check", "B1")?.model).toBe(MODEL_TIERS.standard.model);
  expect(planFor("write-check", "B1", { AI_STANDARD_MODEL: "claude-opus-5-5" })?.model).toBe("claude-opus-5-5");
  expect(planFor("speak-chat", "A1", { AI_LIGHT_MODEL: "x" })?.model).toBe("x");
});

it("maps levels without rules to the nearest one", () => {
  expect(policyLevel("C1")).toBe("B2");
  expect(policyLevel("A2")).toBe("A2");
});
