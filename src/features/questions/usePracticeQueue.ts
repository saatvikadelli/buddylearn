import { useCallback, useEffect, useRef, useState } from "react";

import { getIdea } from "@/data/lessons";
import { useSession } from "@/features/session/SessionContext";

import { bookQuestions } from "./bookQuestions";
import { GeminiError } from "./gemini";
import { generateQuestions } from "./generateQuestions";
import type { Level, PracticeQuestion } from "./types";

/* ---------- Rules (easy to tweak) ---------- */

export const MAX_LEVEL: Level = 5;
export const BREAK_AFTER = 2; // wrong taps in a row -> offer a brain break

/**
 * The level for the next set.
 * 3 or more of 4 right on the first try -> up one. 1 or fewer -> down one. Otherwise stay (new questions).
 */
export function nextLevel(level: Level, firstTryRight: number, total: number): Level {
  if (firstTryRight >= Math.ceil(total * 0.75)) return Math.min(level + 1, MAX_LEVEL) as Level;
  if (firstTryRight <= Math.floor(total * 0.25)) return Math.max(level - 1, 1) as Level;
  return level;
}

/** The child's most frequent mistakes for this idea. */
export function topMistakes(counts: Record<string, number>, n = 2): string[] {
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, n)
    .map(([id]) => id);
}

const same = (a: string, b: string) => a.trim().toLowerCase() === b.trim().toLowerCase();
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
const MAX_ATTEMPTS = 3;

/* ---------- Loading a whole set ---------- */

type LastResult = { firstTryRight: number; total: number; level: Level };

type LoadInput = {
  ideaId: string;
  level: Level;
  size: number;
  /** Questions this child has seen before. */
  avoid: string[];
  targetMistakeIds: string[];
  lastResult?: LastResult;
  fewerWords: boolean;
  language: string;
  /** Stop asking the AI after this long and fill any gap from the book. */
  deadlineMs: number;
};

/**
 * Gets a full set of `size` questions before practice starts. Asks for 2 spare questions,
 * and if the checks drop too many, asks again for the missing ones (until the deadline).
 * Only if the AI cannot fill the set are book questions used, as a backup.
 */
export async function loadPracticeSet(input: LoadInput): Promise<PracticeQuestion[]> {
  const idea = getIdea(input.ideaId);
  if (!idea) return [];
  const started = Date.now();
  /** Pause, but never past the deadline. */
  const pause = (ms: number) => sleep(Math.max(0, Math.min(ms, input.deadlineMs - (Date.now() - started))));
  let set: PracticeQuestion[] = [];

  const addNew = (questions: PracticeQuestion[]) => {
    for (const q of questions) {
      if (set.length >= input.size) break;
      const seenBefore = input.avoid.some((p) => same(p, q.prompt)) || set.some((x) => same(x.prompt, q.prompt));
      if (!seenBefore) set = [...set, q];
    }
  };

  // At most 3 calls per set, so a run of bad drafts cannot use up the free quota.
  for (let attempt = 1; attempt <= MAX_ATTEMPTS && set.length < input.size; attempt++) {
    const left = input.deadlineMs - (Date.now() - started);
    if (left <= 0) break;
    const missing = input.size - set.length;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), left);
    try {
      const { questions, dropped } = await generateQuestions({
        ideaId: input.ideaId,
        level: input.level,
        count: missing + 1, // one spare: fewer questions to write means a faster answer
        targetMistakeIds: input.targetMistakeIds,
        avoidPrompts: [...input.avoid, ...set.map((q) => q.prompt)],
        lastResult: input.lastResult,
        fewerWords: input.fewerWords,
        language: input.language,
        signal: controller.signal,
      });
      const before = set.length;
      addNew(questions);
      if (set.length === before && attempt < MAX_ATTEMPTS) await pause(1_000); // nothing usable: short pause
      if (__DEV__) {
        const secs = ((Date.now() - started) / 1000).toFixed(1);
        console.log(`[questions] level ${input.level}: kept ${questions.length}, dropped ${dropped.length}, set ${set.length}/${input.size}, ${secs}s`);
      }
    } catch (err) {
      if (__DEV__) {
        const secs = Math.round((Date.now() - started) / 1000);
        console.warn(
          controller.signal.aborted
            ? `[questions] Gemini took longer than ${secs}s, stopped waiting`
            : `[questions] AI error: ${err instanceof Error ? err.message : err}`,
        );
      }
      if (err instanceof GeminiError && err.status === 429) break; // out of free quota: use the book
      if (!controller.signal.aborted && attempt < MAX_ATTEMPTS) await pause(2_000);
    } finally {
      clearTimeout(timer);
    }
  }

  if (set.length < input.size) {
    if (__DEV__) console.log(`[questions] AI gave ${set.length}/${input.size}, filling the rest from the book`);
    addNew(bookQuestions(idea));
    // Every book question already seen: reuse them with a new option order.
    if (set.length < input.size) set = [...set, ...bookQuestions(idea)].slice(0, input.size);
  }
  return set;
}

/*
 * Kept in memory while the app is open, per child and idea:
 * - the next set, loaded in the background while the child looks at their results
 * - the last result, so the AI knows how the child did
 */
const prefetched = new Map<string, { level: Level; promise: Promise<PracticeQuestion[]> }>();
const lastResults = new Map<string, LastResult>();
const keyOf = (studentId: string | null, ideaId: string) => `${studentId ?? "guest"}|${ideaId}`;

/* ---------- The hook ---------- */

type Options = {
  /** Pass comfort "fewer words" here: the AI writes shorter sentences. */
  fewerWords?: boolean;
  language?: string;
  /** Turn off to use only the questions in data/lessons.ts. */
  ai?: boolean;
  /** Questions per set. */
  size?: number;
  /** Longest the loading screen waits for the AI before using book questions. */
  deadlineMs?: number;
};

export type AnswerResult = { correct: boolean; firstTry: boolean; mistakeId: string | null };
export type QuestionResult = { prompt: string; rightFirstTime: boolean };
export type SetSummary = {
  firstTryRight: number;
  total: number;
  level: Level;
  nextLevel: Level;
  results: QuestionResult[];
};

/**
 * One set of practice questions for one idea, loaded all at once and then shown one by one.
 * At the end, finishSet() scores it, saves the level, and starts loading the next set
 * in the background, so "Practise 4 more" (or coming back later) is quick.
 */
export function usePracticeQueue(
  ideaId: string,
  { fewerWords = false, language = "English", ai = true, size = 4, deadlineMs = 40_000 }: Options = {},
) {
  const idea = getIdea(ideaId);
  const { studentId, ideaLevels, mistakeCounts, seenPrompts, recordMistake, setIdeaLevel, rememberPrompts, earnStars } =
    useSession();
  const key = keyOf(studentId, ideaId);

  const [level] = useState<Level>(() => ideaLevels[ideaId] ?? 1);
  const [lastResult] = useState<LastResult | undefined>(() => lastResults.get(key));
  const [set, setSet] = useState<PracticeQuestion[] | null>(null);
  const [index, setIndex] = useState(0);
  const [tries, setTries] = useState(0);
  const [misses, setMisses] = useState(0);
  const [results, setResults] = useState<QuestionResult[]>([]);

  // Latest values for the async work, without re-running effects.
  const latest = useRef({ mistakeCounts, seenPrompts, fewerWords, language });
  latest.current = { mistakeCounts, seenPrompts, fewerWords, language };
  const triesRef = useRef(0);
  const loadRef = useRef<Promise<PracticeQuestion[]> | null>(null);
  const finished = useRef<SetSummary | null>(null);

  const inputFor = (lvl: Level, extraAvoid: string[], last?: LastResult): LoadInput => ({
    ideaId,
    level: lvl,
    size,
    avoid: [...(latest.current.seenPrompts[ideaId] ?? []), ...extraAvoid],
    targetMistakeIds: topMistakes(latest.current.mistakeCounts[ideaId] ?? {}),
    lastResult: last,
    fewerWords: latest.current.fewerWords,
    language: latest.current.language,
    deadlineMs,
  });

  // Load the whole set once: use the one prepared in the background if it is there.
  useEffect(() => {
    if (!idea) return;
    if (!loadRef.current) {
      const ready = prefetched.get(key);
      prefetched.delete(key);
      loadRef.current = !ai
        ? Promise.resolve(bookQuestions(idea).slice(0, size))
        : ready && ready.level === level
          ? ready.promise
          : loadPracticeSet(inputFor(level, [], lastResult));
    }
    let active = true;
    loadRef.current.then((qs) => active && setSet(qs));
    return () => {
      active = false;
    };
    // Runs once per set; inputs are read from refs.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const question = set ? (set[index] ?? null) : null;

  // Remember every question shown, so later sets never repeat it.
  const prompt = question?.prompt;
  useEffect(() => {
    if (prompt) rememberPrompts(ideaId, [prompt]);
  }, [ideaId, prompt, rememberPrompts]);

  /** Check the child's choice. Gives a star for every right answer, first try or not. */
  const answer = useCallback(
    (optionId: string): AnswerResult | null => {
      if (!question) return null;
      const correct = optionId === question.correctId;
      const firstTry = triesRef.current === 0;
      triesRef.current += 1;
      setTries(triesRef.current);

      if (firstTry) setResults((r) => [...r, { prompt: question.prompt, rightFirstTime: correct }]);
      const mistakeId = correct ? null : (question.catches[optionId] ?? null);
      if (mistakeId) recordMistake(ideaId, mistakeId);
      if (correct) {
        earnStars(1);
        setMisses(0);
      } else {
        setMisses((n) => n + 1);
      }
      return { correct, firstTry, mistakeId };
    },
    [question, ideaId, recordMistake, earnStars],
  );

  /** Show the next question of the set. */
  const next = useCallback(() => {
    triesRef.current = 0;
    setTries(0);
    setIndex((i) => i + 1);
  }, []);

  /** Call after the brain break ("I'm ready"). */
  const takeBreak = useCallback(() => setMisses(0), []);

  /**
   * Call once when the last question is done. Scores the set, saves the level for next
   * time, and starts loading the next set in the background.
   */
  const finishSet = useCallback((): SetSummary => {
    if (finished.current) return finished.current;
    const total = set?.length ?? size;
    const firstTryRight = results.filter((r) => r.rightFirstTime).length;
    const upcoming = nextLevel(level, firstTryRight, total);
    const summary: SetSummary = { firstTryRight, total, level, nextLevel: upcoming, results };
    finished.current = summary;

    setIdeaLevel(ideaId, upcoming);
    const last: LastResult = { firstTryRight, total, level };
    lastResults.set(key, last);
    if (ai && idea) {
      const thisSet = (set ?? []).map((q) => q.prompt);
      prefetched.set(key, { level: upcoming, promise: loadPracticeSet(inputFor(upcoming, thisSet, last)) });
    }
    return summary;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [set, results, level, ideaId, key, ai, idea, size, setIdeaLevel]);

  return {
    idea,
    /** True while the set is being written. */
    loading: set === null,
    question,
    /** 0-based position in the set. */
    index,
    total: set?.length ?? size,
    isLast: set !== null && index >= set.length - 1,
    /** "Hint 1 of 2" after the first wrong tap, "Hint 2 of 2" after that. */
    hint: question ? (tries >= 2 ? question.hint2 : question.hint) : "",
    hintNumber: (tries >= 2 ? 2 : 1) as 1 | 2,
    tries,
    level,
    /** True when this set is based on an earlier set (for the loading message). */
    basedOnLastTime: lastResult !== undefined,
    /** Show the Brain Break screen when this turns true. */
    needsBreak: misses >= BREAK_AFTER,
    takeBreak,
    answer,
    next,
    finishSet,
    results,
  };
}