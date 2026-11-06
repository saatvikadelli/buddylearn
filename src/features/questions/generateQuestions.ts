import { icons, type IconName } from "@/components/ui/icons";
import { getIdea } from "@/data/lessons";
import { getMistakes } from "@/data/mistakes";
import { findChapter } from "@/data/syllabus";

import { shuffleOptions } from "./bookQuestions";
import { generateJson } from "./gemini";
import type { AnswerCheck, Level, PracticeQuestion } from "./types";
import { verifyQuestion } from "./verifyQuestion";

const LEVELS: Record<Level, string> = {
  1: "Level 1 of 5, warm-up. One step. A familiar object, like a roti or a glass of water.",
  2: "Level 2 of 5. One step with numbers.",
  3: "Level 3 of 5. Two small steps, or options that look close.",
  4: "Level 4 of 5. Two steps, or comparing two things.",
  5: "Level 5 of 5. A short real-life problem with two or three steps.",
};

const ICON_NAMES = Object.keys(icons) as IconName[];

const system = (maxWords: number) => `You write practice questions for Class 5 children in India (CBSE, NCERT books).
Every child in the class gets these same questions. Write them so children with dyslexia or ADHD
can read them easily, without the questions looking easier or different to anyone.

Writing rules:
- At most ${maxWords} words in any sentence. One idea per sentence.
- Plain, everyday words. Numbers as digits. Fractions as digits with a slash, like 2/4.
- Indian daily life: roti, chapati, kirana shop, school, train, festival, home.
- Never ask "which is NOT" or use double negatives.
- Options are at most 5 words.
- Warm tone. Never use the words "wrong", "easy", "simple", "slow" or "weak".
- Teach only what the idea covers. Nothing scary. No real people.

Question rules:
- Exactly 3 options. Exactly one is correct.
- Each wrong option must be the answer a child gives when making one listed mistake. Tag it with that mistake id.
- hint: a gentle nudge. It must not give the answer.
- hint2: shows the way more clearly. The child still has to pick.
- explain: three ways to explain THIS question.
  story: exactly 3 short panels, each with one icon from the allowed list.
  picture: "big" is a short symbol line like "1/2 = 2/4", plus a caption.
  real: two short lines from real life.

Answer checks:
- If the correct answer is a fraction that must equal a target fraction, use "fraction-equal" and put the target (like "1/2") in checkTarget.
- If the correct answer is a single number, use "number-equal" and put that number in checkTarget.
- Otherwise use "none" and an empty checkTarget.`;

type RawQuestion = {
  prompt: string;
  options: string[];
  correctIndex: number;
  hint: string;
  hint2: string;
  catches: { optionIndex: number; mistakeId: string }[];
  checkKind: "fraction-equal" | "number-equal" | "none";
  checkTarget: string;
  explain: {
    story: { icon: string; caption: string }[];
    picture: { big: string; caption: string };
    real: { line1: string; line2: string };
  };
};

const STR = { type: "STRING" } as const;
const obj = (properties: Record<string, object>) => ({
  type: "OBJECT",
  properties,
  required: Object.keys(properties),
});

const schemaFor = (mistakeIds: string[]) =>
  obj({
    questions: {
      type: "ARRAY",
      items: obj({
        prompt: STR,
        options: { type: "ARRAY", items: STR },
        correctIndex: { type: "INTEGER" },
        hint: STR,
        hint2: STR,
        catches: {
          type: "ARRAY",
          items: obj({ optionIndex: { type: "INTEGER" }, mistakeId: { type: "STRING", enum: mistakeIds } }),
        },
        checkKind: { type: "STRING", enum: ["fraction-equal", "number-equal", "none"] },
        checkTarget: STR,
        explain: obj({
          story: { type: "ARRAY", items: obj({ icon: { type: "STRING", enum: ICON_NAMES }, caption: STR }) },
          picture: obj({ big: STR, caption: STR }),
          real: obj({ line1: STR, line2: STR }),
        }),
      }),
    },
  });

const text = (v: unknown) => String(v ?? "").trim();
const isIcon = (v: unknown): v is IconName => typeof v === "string" && v in icons;

function toQuestion(raw: RawQuestion, ideaId: string, level: Level, id: string, fallbackIcon: IconName): PracticeQuestion {
  const options = (raw.options ?? []).map((t, k) => ({ id: `${id}-o${k}`, text: text(t) }));
  const catches: Record<string, string> = {};
  for (const c of raw.catches ?? []) {
    const option = options[c.optionIndex];
    if (option) catches[option.id] = c.mistakeId;
  }
  const check: AnswerCheck =
    raw.checkKind === "fraction-equal" || raw.checkKind === "number-equal"
      ? { kind: raw.checkKind, target: text(raw.checkTarget) }
      : { kind: "none" };
  const e = raw.explain;

  return {
    id,
    ideaId,
    level,
    prompt: text(raw.prompt),
    options,
    correctId: options[raw.correctIndex]?.id ?? "",
    hint: text(raw.hint),
    hint2: text(raw.hint2),
    catches,
    explain: {
      story: (e?.story ?? []).map((s) => ({ icon: isIcon(s.icon) ? s.icon : fallbackIcon, caption: text(s.caption) })),
      picture: { big: text(e?.picture?.big), caption: text(e?.picture?.caption) },
      real: { icon: fallbackIcon, line1: text(e?.real?.line1), line2: text(e?.real?.line2) },
    },
    check,
    from: "ai",
  };
}

type Input = {
  ideaId: string;
  level: Level;
  /** How many to ask for. Some may be dropped by the checks. */
  count?: number;
  /** Aim wrong options at these mistakes (from this child's recent answers). */
  targetMistakeIds?: string[];
  /** Questions this child has already seen, so the AI does not repeat them. */
  avoidPrompts?: string[];
  /** From the "Fewer words" comfort setting: shorter sentences for this child. */
  fewerWords?: boolean;
  /** How this child did on their last set for this idea. */
  lastResult?: { firstTryRight: number; total: number; level: Level };
  language?: string;
  signal?: AbortSignal;
};

/**
 * Writes new questions with Gemini and keeps only the ones that pass every code check.
 * Never send a child's name or answers here, only the idea, level and mistake ids.
 */
export async function generateQuestions({
  ideaId,
  level,
  count = 3,
  targetMistakeIds = [],
  avoidPrompts = [],
  fewerWords = false,
  lastResult,
  language = "English",
  signal,
}: Input): Promise<{ questions: PracticeQuestion[]; dropped: string[][] }> {
  const idea = getIdea(ideaId);
  if (!idea) throw new Error(`Unknown idea: ${ideaId}`);
  const mistakes = getMistakes(ideaId);
  if (mistakes.length === 0) throw new Error(`Add mistakes for ${ideaId} in data/mistakes.ts first.`);
  const chapter = findChapter(idea.chapterId);
  const maxWords = fewerWords ? 8 : 12;

  const targets = mistakes.filter((m) => targetMistakeIds.includes(m.id));
  const avoid = [...new Set([...avoidPrompts, ...idea.questions.map((q) => q.prompt)])].slice(-30);

  const prompt = [
    `Book: ${chapter ? `${chapter.book.title}, chapter ${chapter.chapter.number}: ${chapter.chapter.title}` : idea.chapterId}`,
    `Idea: ${idea.title}`,
    `What the child has learned:`,
    ...idea.story.map((s) => `- ${s.caption}`),
    `- ${idea.picture.caption}`,
    `- ${idea.real.line1} ${idea.real.line2}`,
    ``,
    `Level: ${LEVELS[level]}`,
    lastResult
      ? `Last time, at level ${lastResult.level}, this child got ${lastResult.firstTryRight} of ${lastResult.total} right on the first try.`
      : `This is the child's first set on this idea.`,
    `Language: ${language}`,
    `Mistakes you may use for wrong options (id: meaning):`,
    ...mistakes.map((m) => `- ${m.id}: ${m.label}`),
    targets.length
      ? `Focus the wrong options on these mistakes: ${targets.map((m) => m.id).join(", ")}.`
      : `Use a mix of the mistakes.`,
    `Allowed icons: ${ICON_NAMES.join(", ")}`,
    `Do not repeat these questions:`,
    ...avoid.map((p) => `- ${p}`),
    ``,
    `Write ${count} new questions, ordered from the gentlest to the most challenging within this level.`,
  ].join("\n");

  const result = await generateJson<{ questions: RawQuestion[] }>({
    system: system(maxWords),
    prompt,
    schema: schemaFor(mistakes.map((m) => m.id)),
    signal,
  });

  const idBase = `ai-${ideaId}-${Date.now().toString(36)}`;
  const questions: PracticeQuestion[] = [];
  const dropped: string[][] = [];
  (result.questions ?? []).forEach((raw, i) => {
    const q = toQuestion(raw, ideaId, level, `${idBase}-${i}`, idea.real.icon);
    const v = verifyQuestion(q, language, maxWords);
    if (v.ok) questions.push(shuffleOptions(q));
    else dropped.push(v.problems);
  });
  if (__DEV__ && dropped.length) console.log(`[questions] dropped ${dropped.length}`, dropped);
  return { questions, dropped };
}