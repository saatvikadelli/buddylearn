import { icons, type IconName } from "@/components/ui/icons";
import { getIdea } from "@/data/lessons";
import { getMistakes } from "@/data/mistakes";
import { findChapter } from "@/data/syllabus";

import { generateJson } from "./gemini";
import type { Explain, Level } from "./types";
import { checkFractionEquation, findLongSentence } from "./verifyQuestion";

const ICON_NAMES = Object.keys(icons) as IconName[];

const system = (maxWords: number) => `You write short lessons for Class 5 children in India (CBSE, NCERT books).
Every child in the class sees the same kind of lesson. Write so children with dyslexia or ADHD
can follow easily, without the lesson looking easier or different to anyone.

Explain ONE idea in three ways:
- story: a tiny story in exactly 3 panels. One Indian child, everyday life. Each panel has one icon from the allowed list.
- picture: "big" is a short symbol line (like "1/2 = 2/4 = 4/8" or "Boil → Cool → Drink"), plus a caption.
- real: one icon and two short lines about something the child can see or do at home or school.

Writing rules:
- At most ${maxWords} words in any sentence. One idea per sentence.
- Plain, everyday words. Numbers as digits. Fractions as digits with a slash, like 2/4.
- Every fact must be true. Every "=" in "big" must be exactly true.
- Teach only what the idea covers. Nothing scary. No real people.
- Warm tone. Never use the words "easy", "simple", "slow" or "weak".`;

type RawLesson = {
  story: { icon: string; caption: string }[];
  picture: { big: string; caption: string };
  real: { icon: string; line1: string; line2: string };
};

const STR = { type: "STRING" } as const;
const ICON = { type: "STRING", enum: ICON_NAMES } as const;
const obj = (properties: Record<string, object>) => ({ type: "OBJECT", properties, required: Object.keys(properties) });

const SCHEMA = obj({
  story: { type: "ARRAY", items: obj({ icon: ICON, caption: STR }) },
  picture: obj({ big: STR, caption: STR }),
  real: obj({ icon: ICON, line1: STR, line2: STR }),
});

const text = (v: unknown) => String(v ?? "").trim();
const isIcon = (v: unknown): v is IconName => typeof v === "string" && v in icons;

/** Returns the problems with a lesson; empty means it is fine to show. */
export function verifyLesson(lesson: Explain, language: string, maxWords: number): string[] {
  const problems: string[] = [];
  if (lesson.story.length !== 3) problems.push("Photo story needs exactly 3 panels.");
  const all = [
    ...lesson.story.map((s) => s.caption),
    lesson.picture.big,
    lesson.picture.caption,
    lesson.real.line1,
    lesson.real.line2,
  ];
  if (all.some((t) => !t)) problems.push("Some lesson text is empty.");
  const badEquation = checkFractionEquation(lesson.picture.big);
  if (badEquation) problems.push(badEquation);
  if (language === "English") {
    const long = findLongSentence(all.filter((t) => t !== lesson.picture.big), maxWords);
    if (long) problems.push(`Sentence over ${maxWords} words: "${long}"`);
  }
  return problems;
}

type Input = {
  ideaId: string;
  /** This child's most frequent mistakes on this idea: the lesson gently clears them up. */
  focusMistakeIds?: string[];
  /** The child's practice level for this idea (1 to 5). Higher levels get a deeper explanation. */
  level?: Level;
  fewerWords?: boolean;
  language?: string;
};

/**
 * Writes a fresh Photo story / Picture / Real life lesson with Gemini.
 * Returns null if the lesson fails the checks (the screen then shows the book lesson).
 * Never send a child's name here.
 */
export async function generateLesson({
  ideaId,
  focusMistakeIds = [],
  level = 1,
  fewerWords = false,
  language = "English",
}: Input): Promise<Explain | null> {
  const idea = getIdea(ideaId);
  if (!idea) throw new Error(`Unknown idea: ${ideaId}`);
  const chapter = findChapter(idea.chapterId);
  const maxWords = fewerWords ? 8 : 12;
  const focus = getMistakes(ideaId).filter((m) => focusMistakeIds.includes(m.id));

  const prompt = [
    `Book: ${chapter ? `${chapter.book.title}, chapter ${chapter.chapter.number}: ${chapter.chapter.title}` : idea.chapterId}`,
    `Idea: ${idea.title}`,
    `What the book teaches (stay within this):`,
    ...idea.story.map((s) => `- ${s.caption}`),
    `- ${idea.picture.big}: ${idea.picture.caption}`,
    `- ${idea.real.line1} ${idea.real.line2}`,
    ``,
    `Language: ${language}`,
    level <= 1
      ? `This child is new to this idea. Start from the very basics with one familiar object.`
      : level <= 3
        ? `This child knows the basics (level ${level} of 5). Use numbers, and show the idea a second way.`
        : `This child is confident (level ${level} of 5). Use a slightly bigger example and connect it to daily life.`,
    focus.length
      ? `This child sometimes mixes these up. Gently make them clear, without naming the mistake:\n${focus.map((m) => `- ${m.label}`).join("\n")}`
      : ``,
    `Allowed icons: ${ICON_NAMES.join(", ")}`,
    `Write a new lesson. Use a different story than the book's.`,
  ].join("\n");

  const raw = await generateJson<RawLesson>({ system: system(maxWords), prompt, schema: SCHEMA });

  const lesson: Explain = {
    story: (raw.story ?? []).map((s) => ({ icon: isIcon(s.icon) ? s.icon : idea.real.icon, caption: text(s.caption) })),
    picture: { big: text(raw.picture?.big), caption: text(raw.picture?.caption) },
    real: {
      icon: isIcon(raw.real?.icon) ? raw.real.icon : idea.real.icon,
      line1: text(raw.real?.line1),
      line2: text(raw.real?.line2),
    },
  };

  const problems = verifyLesson(lesson, language, maxWords);
  if (problems.length) {
    if (__DEV__) console.log("[lesson] dropped:", problems);
    return null;
  }
  return lesson;
}