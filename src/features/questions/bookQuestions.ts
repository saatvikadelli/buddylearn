import type { Idea } from "@/data/lessons";

import type { PracticeQuestion } from "./types";

export function shuffle<T>(items: T[]): T[] {
  const a = [...items];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** New option order every time, so the right answer is never always in the same spot. */
export const shuffleOptions = (q: PracticeQuestion): PracticeQuestion => ({ ...q, options: shuffle(q.options) });

let round = 0;

/**
 * The questions written in data/lessons.ts. Used to start instantly, and to keep going
 * when the AI is slow, offline or out of free quota. Ids get a round number so a repeat
 * is treated as a fresh question.
 */
export function bookQuestions(idea: Idea): PracticeQuestion[] {
  round += 1;
  return shuffle(
    idea.questions.map(
      (q): PracticeQuestion =>
        shuffleOptions({
          id: `${q.id}-r${round}`,
          ideaId: idea.id,
          level: 1,
          prompt: q.prompt,
          options: q.options.map((o) => ({ ...o, id: `${o.id}-r${round}` })),
          correctId: `${q.correctId}-r${round}`,
          hint: q.hint,
          hint2: idea.picture.caption,
          catches: {},
          explain: { story: idea.story, picture: idea.picture, real: idea.real },
          check: { kind: "none" },
          from: "book",
        }),
    ),
  );
}