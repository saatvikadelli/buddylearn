import { useEffect, useState } from "react";

import { getIdea } from "@/data/lessons";
import { useSession } from "@/features/session/SessionContext";

import { generateLesson } from "./generateLesson";
import type { Explain } from "./types";
import { topMistakes } from "./usePracticeQueue";

import type { Level } from "./types";

type Options = { fewerWords: boolean; focusMistakeIds: string[]; level: Level; language: string };

/** One lesson per idea + settings, shared by the Chapter screen (prefetch) and the Learn screen. */
const cache = new Map<string, { promise: Promise<Explain | null>; lesson?: Explain | null }>();

/**
 * A lesson is reused until something it depends on changes: the child's level, their main
 * mistakes, "fewer words" or the language. Then the next visit gets a newly written lesson.
 */
const keyOf = (ideaId: string, o: Options) =>
  [ideaId, o.level, o.focusMistakeIds.join("+"), o.fewerWords ? "fw" : "-", o.language].join("|");

/** Try twice: one lesson may fail the checks (a long sentence, a wrong "=" line). */
async function writeLesson(ideaId: string, o: Options) {
  const first = await generateLesson({ ideaId, ...o });
  return first ?? generateLesson({ ideaId, ...o });
}

function startLesson(ideaId: string, o: Options) {
  const key = keyOf(ideaId, o);
  const existing = cache.get(key);
  if (existing) return existing;

  const entry: { promise: Promise<Explain | null>; lesson?: Explain | null } = {
    promise: Promise.resolve(null),
  };
  entry.promise = writeLesson(ideaId, o)
    .then((lesson) => {
      entry.lesson = lesson;
      if (!lesson) cache.delete(key); // failed the checks: try again next visit
      return lesson;
    })
    .catch((err: unknown) => {
      if (__DEV__) console.warn("[lesson] AI failed:", err instanceof Error ? err.message : err);
      cache.delete(key); // busy or offline: try again next visit
      return null;
    });
  cache.set(key, entry);
  return entry;
}

/** The settings a lesson depends on, read from the child's session. */
function useLessonOptions(ideaId: string): Options {
  const { comfort, mistakeCounts, ideaLevels } = useSession();
  return {
    fewerWords: comfort.fewerWords, // rename here if your comfort field has another name
    focusMistakeIds: topMistakes(mistakeCounts[ideaId] ?? {}),
    level: ideaLevels[ideaId] ?? 1,
    language: "English",
  };
}

/** Call on the Chapter screen so the lesson is usually ready before the child opens it. */
export function usePrefetchLesson(ideaId: string | undefined) {
  const o = useLessonOptions(ideaId ?? "");
  const key = ideaId ? keyOf(ideaId, o) : "";
  useEffect(() => {
    if (ideaId && getIdea(ideaId)) startLesson(ideaId, o);
    // key covers every option that changes the lesson
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
}

/**
 * The lesson to show on the Learn screen.
 * - AI lesson ready: shown straight away.
 * - Still writing: waits up to `waitMs`, then shows the book lesson (no endless spinner).
 * - Failed: shows the book lesson.
 */
export function useLesson(ideaId: string | undefined, waitMs = 20_000) {
  const idea = getIdea(ideaId);
  const o = useLessonOptions(ideaId ?? "");
  const key = ideaId ? keyOf(ideaId, o) : "";

  const cached = cache.get(key)?.lesson;
  const [lesson, setLesson] = useState<Explain | null>(cached ?? null);
  const [ready, setReady] = useState(cached !== undefined || !idea);

  useEffect(() => {
    if (!idea || !ideaId) return;
    const entry = startLesson(ideaId, o);
    if (entry.lesson !== undefined) {
      setLesson(entry.lesson);
      setReady(true);
      return;
    }
    let active = true;
    let waiting = true;
    const timer = setTimeout(() => {
      if (!active) return;
      waiting = false;
      setReady(true);
    }, waitMs);
    entry.promise.then((l) => {
      // Only use the AI lesson if the child is still waiting; never change it under them.
      if (!active || !waiting) return;
      waiting = false;
      clearTimeout(timer);
      setLesson(l);
      setReady(true);
    });
    return () => {
      active = false;
      clearTimeout(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, waitMs]);

  const book: Explain | null = idea ? { story: idea.story, picture: idea.picture, real: idea.real } : null;
  return {
    /** null only while waiting (show a short loading card). */
    explain: ready ? (lesson ?? book) : null,
    from: lesson ? ("ai" as const) : ("book" as const),
    ready,
  };
}