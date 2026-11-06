import type { Material } from "@/data/activities";

export type Goal = "Introduce" | "Practise" | "Revise" | "Assess";

/** What the teacher chose on the Activities page. Passed between screens as one JSON string. */
export type Plan = {
  topicId: string;
  goal: Goal;
  groupSize: number;
  minutes: 10 | 20 | 40;
  materials: Material[];
  local: boolean;
};

export const GOALS: Goal[] = ["Introduce", "Practise", "Revise", "Assess"];
export const TIMES: Plan["minutes"][] = [10, 20, 40];

export const DEFAULT_PLAN: Plan = {
  topicId: "maths-2-i2",
  goal: "Practise",
  groupSize: 4,
  minutes: 20,
  materials: ["paper", "scissors"],
  local: true,
};

export const serializePlan = (plan: Plan) => JSON.stringify(plan);

export function parsePlan(text: string | undefined): Plan {
  if (!text) return DEFAULT_PLAN;
  try {
    return { ...DEFAULT_PLAN, ...(JSON.parse(text) as Partial<Plan>) };
  } catch {
    return DEFAULT_PLAN;
  }
}