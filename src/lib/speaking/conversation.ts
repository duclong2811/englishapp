import "server-only";
import { getScenario, type Scenario } from "@/content/speaking/scenarios";
import topics from "@/content/vocab/topics.json";
import type { Turn } from "./schema";

/** Words from the scenario's topics, used to steer the AI's vocabulary. */
export function targetWords(scenario: Scenario, limit = 30): string[] {
  const words: string[] = [];
  for (const id of scenario.topicIds) {
    // Only the topic list is imported here: the full dictionary would bloat the API worker.
    const topic = topics.topics.find((t) => t.id === id);
    if (topic) words.push(...topic.words.map((w) => w.replace(/-/g, " ")));
  }
  return words.slice(0, limit);
}

/** The API needs the conversation to start with a user turn; the AI's opening line follows it. */
export function toApiMessages(scenario: Scenario, messages: Turn[]) {
  const rest = messages[0]?.role === "assistant" && messages[0].content === scenario.opening ? messages.slice(1) : messages;
  return [
    { role: "user" as const, content: "(The learner arrives. Start the conversation.)" },
    { role: "assistant" as const, content: scenario.opening },
    ...rest.map((m) => ({ role: m.role, content: m.content })),
  ];
}

export function findScenario(id: string) {
  return getScenario(id);
}

/** Server-side fallbacks on refusals are available for these models. */
export function supportsFallbacks(model: string) {
  return /^claude-(opus-5-5|sonnet-5-5|fable-5-[12]|opus-5)$/.test(model);
}
