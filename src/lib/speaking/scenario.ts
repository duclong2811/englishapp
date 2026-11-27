/** A conversation the AI can hold: a role-play for a topic, or free chat. */
export type Scenario = {
  id: string;
  mode: "roleplay" | "free";
  title: string;
  /** What the learner tries to do (Vietnamese). */
  goal: string;
  /** Vocabulary topics whose words the AI should use. */
  topicIds: string[];
  aiRole: string;
  learnerRole: string;
  setting: string;
  /** First line, said by the AI. Static so the conversation starts instantly. */
  opening: string;
  /** Example answers the learner can tap if stuck on the first turn. */
  starters: string[];
};
