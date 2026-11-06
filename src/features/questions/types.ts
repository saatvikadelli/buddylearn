import type { Idea, Option } from "@/data/lessons";

/** 1 = gentlest. A child moves up one level per visit when they do well. */
export type Level = 1 | 2 | 3 | 4 | 5;

/** The three ways to explain, same shape as an Idea, so the Learn screen UI can be reused. */
export type Explain = Pick<Idea, "story" | "picture" | "real">;

/** What code can re-solve. "none" = no numeric answer to check (e.g. EVS). */
export type AnswerCheck =
  | { kind: "fraction-equal"; target: string } // correct option must equal target, e.g. "1/2"
  | { kind: "number-equal"; target: string } // correct option must equal target, e.g. "2"
  | { kind: "none" };

/** One question as the practice screen shows it. Book and AI questions look identical. */
export type PracticeQuestion = {
  id: string;
  ideaId: string;
  level: Level;
  prompt: string;
  options: Option[];
  correctId: string;
  /** "Hint 1 of 2": a gentle nudge. */
  hint: string;
  /** "Hint 2 of 2": shows the way, the child still picks. */
  hint2: string;
  /** optionId -> mistake id (data/mistakes.ts). Only wrong options have one. */
  catches: Record<string, string>;
  /** "Explain it another way" for this exact question. */
  explain: Explain;
  check: AnswerCheck;
  from: "ai" | "book";
};

export type VerifyResult = {
  /** true/false = code re-solved it. null = nothing numeric to check. */
  answerSolved: boolean | null;
  /** Every wrong option catches a known mistake for this idea. */
  mistakesTagged: boolean;
  /** Short sentences, short options, no "not" questions. null = not checked for this language. */
  readable: boolean | null;
  problems: string[];
  /** false = never shown to a child. */
  ok: boolean;
};