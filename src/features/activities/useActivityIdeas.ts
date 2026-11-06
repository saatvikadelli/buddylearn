import { useCallback, useEffect, useRef, useState } from "react";

import { ACTIVITIES, rememberActivities, type Activity } from "@/data/activities";

import { generateActivities } from "./generateActivities";
import { serializePlan, type Plan } from "./plan";

const COUNT = 3;
const MAX_ATTEMPTS = 2;
const DEADLINE_MS = 45_000;

/** Same plan + same "Surprise me" round = same ideas (no new AI call when going back and forth). */
const cache = new Map<string, Promise<Result>>();

export type Result = { activities: Activity[]; from: "ai" | "library" };

/** Library activities for this topic, the ones that fit the plan first. Used only as a backup. */
function fromLibrary(plan: Plan): Activity[] {
  return ACTIVITIES.filter((a) => a.topicIds.includes(plan.topicId))
    .map((a) => ({ a, fits: a.minutes <= plan.minutes && a.needs.every((m) => plan.materials.includes(m)) }))
    .sort((x, y) => Number(y.fits) - Number(x.fits))
    .map((x) => x.a)
    .slice(0, COUNT);
}

async function load(plan: Plan, avoidTitles: string[]): Promise<Result> {
  const started = Date.now();
  let found: Activity[] = [];
  for (let attempt = 1; attempt <= MAX_ATTEMPTS && found.length < COUNT; attempt++) {
    const left = DEADLINE_MS - (Date.now() - started);
    if (left <= 0) break;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), left);
    try {
      const { activities, dropped } = await generateActivities(plan, {
        count: COUNT - found.length + 1, // one spare in case the checks drop one
        avoidTitles: [...avoidTitles, ...found.map((a) => a.title)],
        signal: controller.signal,
      });
      found = [...found, ...activities].slice(0, COUNT);
      if (__DEV__) {
        const secs = ((Date.now() - started) / 1000).toFixed(1);
        console.log(`[activities] kept ${activities.length}, dropped ${dropped.length}, have ${found.length}/${COUNT}, ${secs}s`);
      }
    } catch (err) {
      if (__DEV__) {
        console.warn(
          controller.signal.aborted
            ? `[activities] Gemini took longer than ${DEADLINE_MS / 1000}s`
            : `[activities] AI error: ${err instanceof Error ? err.message : err}`,
        );
      }
      if (controller.signal.aborted) break;
    } finally {
      clearTimeout(timer);
    }
  }
  if (found.length === 0) return { activities: fromLibrary(plan), from: "library" };
  rememberActivities(found); // so the Group activity, Groups and Run screens can open them
  return { activities: found, from: "ai" };
}

/**
 * Three activity ideas for the teacher's plan, written by the AI.
 * `surprise()` asks for three new ones that are different from everything shown so far.
 * If the AI fails, the hand-written library activities for this topic are shown instead.
 */
export function useActivityIdeas(plan: Plan) {
  const planKey = serializePlan(plan);
  const [round, setRound] = useState(0);
  const [result, setResult] = useState<Result | null>(null);
  const shownTitles = useRef<string[]>([]);

  useEffect(() => {
    const key = `${planKey}#${round}`;
    let promise = cache.get(key);
    if (!promise) {
      promise = load(plan, shownTitles.current);
      cache.set(key, promise);
      // A failed round should be tried again next time, not served from the cache.
      promise.then((r) => r.from === "library" && cache.delete(key));
    }
    let active = true;
    setResult(null);
    promise.then((r) => {
      if (!active) return;
      shownTitles.current = [...new Set([...shownTitles.current, ...r.activities.map((a) => a.title)])];
      setResult(r);
    });
    return () => {
      active = false;
    };
    // `plan` is fully described by planKey.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [planKey, round]);

  const surprise = useCallback(() => setRound((n) => n + 1), []);

  return {
    loading: result === null,
    activities: result?.activities ?? [],
    from: result?.from ?? null,
    surprise,
  };
}