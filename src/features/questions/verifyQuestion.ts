import { getMistakes } from "@/data/mistakes";

import type { PracticeQuestion, VerifyResult } from "./types";

type Fraction = { n: number; d: number };

export function parseFraction(text: string): Fraction | null {
  const m = text.trim().match(/^(\d+)\s*\/\s*(\d+)$/);
  if (!m) return null;
  const n = Number(m[1]);
  const d = Number(m[2]);
  return d > 0 ? { n, d } : null;
}

export function parseNumber(text: string): number | null {
  const clean = text.replace(/[,\s]/g, "");
  return /^-?\d+(\.\d+)?$/.test(clean) ? Number(clean) : null;
}

const sameFraction = (a: Fraction, b: Fraction) => a.n * b.d === b.n * a.d;

/** Re-solves the answer. Returns null when there is nothing code can check. */
function solve(q: PracticeQuestion, problems: string[]): boolean | null {
  const { check } = q;
  if (check.kind === "none") return null;

  const equalsTarget = (text: string): boolean | null => {
    if (check.kind === "fraction-equal") {
      const target = parseFraction(check.target);
      const value = parseFraction(text);
      return target && value ? sameFraction(target, value) : null;
    }
    const target = parseNumber(check.target);
    const value = parseNumber(text);
    return target !== null && value !== null ? target === value : null;
  };

  let ok = true;
  for (const option of q.options) {
    const equal = equalsTarget(option.text);
    const isCorrect = option.id === q.correctId;
    if (equal === null) {
      // A wrong option that is not a number (e.g. "They are equal") cannot match a numeric target.
      if (isCorrect) {
        problems.push(`Code could not read the correct answer "${option.text}".`);
        ok = false;
      }
    } else if (isCorrect && !equal) {
      problems.push(`The marked answer "${option.text}" is not equal to ${check.target}.`);
      ok = false;
    } else if (!isCorrect && equal) {
      problems.push(`"${option.text}" is also correct, so there are two right answers.`);
      ok = false;
    }
  }
  return ok;
}

const words = (s: string) => s.split(/\s+/).filter(Boolean).length;
const sentences = (s: string) =>
  s
    .split(/[.?!]+/)
    .map((x) => x.trim())
    .filter(Boolean);

/** The first sentence longer than maxWords, or null if all are short enough. */
export function findLongSentence(texts: string[], maxWords: number): string | null {
  return texts.flatMap(sentences).find((s) => words(s) > maxWords) ?? null;
}

/**
 * Checks lines like "1/2 = 2/4 = 4/8": every fraction joined by "=" must be equal.
 * Returns an error message, or null if fine (or if there are no fraction equations).
 */
export function checkFractionEquation(text: string): string | null {
  if (!text.includes("=")) return null;
  const parts = text.split("=").map((p) => parseFraction(p));
  if (parts.some((p) => p === null)) return null; // not a pure fraction equation, nothing to check
  const [first, ...rest] = parts as Fraction[];
  const bad = rest.find((f) => !sameFraction(first, f));
  return bad ? `"${text}" is not true: ${bad.n}/${bad.d} is not equal to ${first.n}/${first.d}.` : null;
}

/**
 * Easy-to-read rules that every child gets (helps dyslexia and ADHD without looking different).
 * English only for now; other languages return null.
 */
function readable(q: PracticeQuestion, language: string, maxWords: number, problems: string[]): boolean | null {
  if (language !== "English") return null;
  const issues: string[] = [];
  const texts = [
    q.prompt,
    q.hint,
    q.hint2,
    ...q.explain.story.map((s) => s.caption),
    q.explain.picture.caption,
    q.explain.real.line1,
    q.explain.real.line2,
  ];
  const long = findLongSentence(texts, maxWords);
  if (long) issues.push(`Sentence over ${maxWords} words: "${long}"`);
  if (words(q.prompt) > maxWords * 2) issues.push("Question is too long.");
  const longOption = q.options.find((o) => words(o.text) > 5);
  if (longOption) issues.push(`Option over 5 words: "${longOption.text}"`);
  if (/\b(not|never|except)\b|n't\b/i.test(q.prompt)) issues.push('Question uses "not"-style wording.');
  problems.push(...issues);
  return issues.length === 0;
}

export function verifyQuestion(q: PracticeQuestion, language = "English", maxWords = 12): VerifyResult {
  const problems: string[] = [];

  // Shape: 3 different options, one marked correct, both hints, 3 story panels.
  let shapeOk = true;
  const fail = (msg: string) => {
    problems.push(msg);
    shapeOk = false;
  };
  if (q.options.length !== 3) fail(`Needs exactly 3 options, got ${q.options.length}.`);
  const texts = q.options.map((o) => o.text.trim().toLowerCase());
  if (new Set(texts).size !== texts.length) fail("Two options are the same.");
  if (texts.some((t) => !t)) fail("An option is empty.");
  if (!q.options.some((o) => o.id === q.correctId)) fail("No option is marked correct.");
  if (!q.prompt.trim() || !q.hint.trim() || !q.hint2.trim()) fail("Question or a hint is empty.");
  if (q.explain.story.length !== 3) fail("Photo story needs exactly 3 panels.");
  const badPicture = checkFractionEquation(q.explain.picture.big);
  if (badPicture) fail(badPicture);

  // Every wrong option must catch a known mistake; the right one must not.
  const allowed = new Set(getMistakes(q.ideaId).map((m) => m.id));
  let mistakesTagged = true;
  for (const option of q.options) {
    const tag = q.catches[option.id];
    if (option.id === q.correctId) {
      if (tag) {
        problems.push("The correct answer is tagged as a mistake.");
        mistakesTagged = false;
      }
    } else if (!tag || !allowed.has(tag)) {
      problems.push(`"${option.text}" does not catch a known mistake.`);
      mistakesTagged = false;
    }
  }

  const answerSolved = shapeOk ? solve(q, problems) : false;
  const isReadable = readable(q, language, maxWords, problems);

  return {
    answerSolved,
    mistakesTagged,
    readable: isReadable,
    problems,
    // No teacher review, so every check is a hard gate.
    ok: shapeOk && mistakesTagged && answerSolved !== false && isReadable !== false,
  };
}