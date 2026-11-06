import { MATERIAL_LABEL, type Activity, type Material } from "@/data/activities";
import { STRENGTHS } from "@/data/analytics";
import { getIdea } from "@/data/lessons";
import { getMistakes } from "@/data/mistakes";
import { findChapter } from "@/data/syllabus";
import { generateJson } from "@/features/questions/gemini";

import type { Plan } from "./plan";

const GOAL_HINT: Record<Plan["goal"], string> = {
  Introduce: "Children are meeting this idea for the first time. Start from something they can touch or see.",
  Practise: "Children know the idea. Give them many short turns to use it.",
  Revise: "Children learned this before. Help them remember and connect it to daily life.",
  Assess: "The teacher wants to see who understands. Each child must show or say their thinking.",
};

const SYSTEM = `You plan buddy sessions: in-class group activities for Class 5 children in India (CBSE, NCERT).
Children work in small mixed teams. Every child has a role, and every role is needed to finish.
Roles let children with different strengths shine: drawing, speaking, building, counting, reading aloud.
Nobody is always "the helper", and no child should stand out as weaker.

Rules:
- Use ONLY the materials listed. If none are listed, the activity needs no materials at all.
- Fit inside the time given, including setting up and sharing.
- Exactly the number of roles asked for, with different names. Each role has a short job.
- For each role, pick 1 or 2 strengths from the allowed list that suit it.
- 4 steps for the teacher, each a short title and one or two plain sentences.
- 2 "watch for" notes: one strength to notice, one common mix-up to look out for.
- Three adjustments: if it is too hard, too easy, or the class is noisy. One sentence each.
- Classroom-safe only: no tasting or drinking anything, no fire, stoves, boiling, knives,
  electricity, climbing or roads. Scissors only if listed.
- Short, clear sentences. Warm tone. Never say "weak", "slow" or "easy".
- The 3 activities must be different kinds, e.g. a hands-on build, a role play, a game.`;

const STR = { type: "STRING" } as const;
const obj = (properties: Record<string, object>) => ({ type: "OBJECT", properties, required: Object.keys(properties) });

const schema = {
  type: "OBJECT",
  properties: {
    activities: {
      type: "ARRAY",
      items: obj({
        title: STR,
        format: STR,
        summary: STR,
        minutes: { type: "INTEGER" },
        needs: { type: "ARRAY", items: STR },
        roles: {
          type: "ARRAY",
          items: obj({ name: STR, job: STR, fits: { type: "ARRAY", items: { type: "STRING", enum: STRENGTHS } } }),
        },
        steps: { type: "ARRAY", items: obj({ title: STR, detail: STR }) },
        watchFor: { type: "ARRAY", items: STR },
        adapt: obj({ tooHard: STR, tooEasy: STR, noisy: STR }),
        localNote: STR,
      }),
    },
  },
  required: ["activities"],
};

type Raw = Omit<Activity, "id" | "topicIds" | "needs"> & { needs: string[] };

const text = (v: unknown) => String(v ?? "").trim();
const UNSAFE =
  // Actions children must not do. ("Why do we boil water?" is fine to talk about, so "boil" is not here.)
  /\b(tast(e|ing)|drink(ing)? (it|the|some|from)|knife|knives|blade|stove|flame|fire|lighter|matchstick|hot water|electric|socket|climb(ing)?|road|traffic)\b/i;
const slug = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 30);

/** Turns material words from the AI ("chart paper", "Scissors") into the app's Material ids. */
function toMaterial(word: string): Material | null {
  const w = word.toLowerCase();
  const found = (Object.keys(MATERIAL_LABEL) as Material[]).find(
    (m) => m === w || MATERIAL_LABEL[m].toLowerCase() === w,
  );
  return found ?? null;
}

/** Every reason this activity cannot be shown. Empty = fine. */
export function checkActivity(a: Activity, plan: Plan): string[] {
  const problems: string[] = [];
  const extra = a.needs.filter((m) => !plan.materials.includes(m));
  if (extra.length) problems.push(`Needs materials the teacher does not have: ${extra.join(", ")}`);
  if (a.minutes < 5 || a.minutes > plan.minutes) problems.push(`Takes ${a.minutes} min, plan is ${plan.minutes} min`);
  if (a.roles.length !== plan.groupSize) problems.push(`Has ${a.roles.length} roles, groups have ${plan.groupSize} children`);
  const names = a.roles.map((r) => r.name.toLowerCase());
  if (new Set(names).size !== names.length) problems.push("Two roles have the same name");
  if (a.roles.some((r) => !r.name || !r.job || r.fits.length === 0)) problems.push("A role is missing its job or strengths");
  if (a.steps.length < 3 || a.steps.length > 5) problems.push(`Has ${a.steps.length} steps (3 to 5 allowed)`);
  if (!a.title || !a.summary || !a.adapt.tooHard || !a.adapt.tooEasy || !a.adapt.noisy) problems.push("Something is empty");
  const all = [a.title, a.summary, ...a.steps.flatMap((s) => [s.title, s.detail]), ...a.roles.map((r) => r.job)].join(" ");
  const unsafe = all.match(UNSAFE);
  if (unsafe) problems.push(`Not classroom-safe: "${unsafe[0]}"`);
  return problems;
}

/**
 * Writes `count` buddy-session activities for the teacher's plan, in the same format as the
 * library in data/activities.ts. Activities that fail the checks are dropped.
 * Only the topic and plan are sent to the AI, never children's names.
 */
export async function generateActivities(
  plan: Plan,
  { count = 3, avoidTitles = [], signal }: { count?: number; avoidTitles?: string[]; signal?: AbortSignal } = {},
): Promise<{ activities: Activity[]; dropped: string[][] }> {
  const idea = getIdea(plan.topicId);
  if (!idea) throw new Error(`Unknown topic: ${plan.topicId}`);
  const chapter = findChapter(idea.chapterId);
  const mixUps = getMistakes(idea.id).map((m) => m.label);
  const materials = plan.materials.map((m) => MATERIAL_LABEL[m]);

  const prompt = [
    `Topic: ${idea.title} (${chapter ? `${chapter.book.subject}, ${chapter.book.title}, chapter ${chapter.chapter.number}: ${chapter.chapter.title}` : idea.chapterId})`,
    `What the children have learned:`,
    ...idea.story.map((s) => `- ${s.caption}`),
    `- ${idea.picture.big}: ${idea.picture.caption}`,
    mixUps.length ? `Common mix-ups in this class:\n${mixUps.map((m) => `- ${m}`).join("\n")}` : ``,
    ``,
    `Goal: ${plan.goal}. ${GOAL_HINT[plan.goal]}`,
    `Time: at most ${plan.minutes} minutes.`,
    `Group size: ${plan.groupSize} children, so exactly ${plan.groupSize} roles.`,
    `Materials the teacher has: ${materials.length ? materials.join(", ") : "nothing (no materials at all)"}.`,
    plan.local
      ? `Make it local: use Indian daily life such as kirana shops, roti, chapati, festivals, the school yard.`
      : `Keep it general.`,
    `Allowed strengths for roles: ${STRENGTHS.join(", ")}.`,
    avoidTitles.length ? `Do not repeat these activities: ${avoidTitles.join(", ")}.` : ``,
    ``,
    `Write ${count} different activities.`,
  ]
    .filter((line) => line !== ``)
    .join("\n");

  const result = await generateJson<{ activities: Raw[] }>({ system: SYSTEM, prompt, schema, signal });

  const stamp = Date.now().toString(36);
  const activities: Activity[] = [];
  const dropped: string[][] = [];
  (result.activities ?? []).forEach((raw, i) => {
    const needs = (raw.needs ?? []).map((w) => toMaterial(text(w)));
    const activity: Activity = {
      id: `ai-${slug(text(raw.title)) || "activity"}-${stamp}-${i}`,
      title: text(raw.title),
      format: text(raw.format) || "Group activity",
      summary: text(raw.summary),
      topicIds: [plan.topicId],
      minutes: Number(raw.minutes) || 0,
      needs: needs.filter((m): m is Material => m !== null),
      roles: (raw.roles ?? []).map((r) => ({
        name: text(r.name),
        job: text(r.job),
        fits: (r.fits ?? []).filter((f) => STRENGTHS.includes(f)),
      })),
      steps: (raw.steps ?? []).map((s) => ({ title: text(s.title), detail: text(s.detail) })),
      watchFor: (raw.watchFor ?? []).map(text).filter(Boolean).slice(0, 3),
      adapt: { tooHard: text(raw.adapt?.tooHard), tooEasy: text(raw.adapt?.tooEasy), noisy: text(raw.adapt?.noisy) },
      localNote: text(raw.localNote),
    };
    const problems = checkActivity(activity, plan);
    // A material word we could not recognise also counts as "not in the teacher's list".
    if (needs.some((m) => m === null)) problems.push(`Unknown material: ${raw.needs.join(", ")}`);
    if (problems.length) dropped.push(problems);
    else activities.push(activity);
  });
  if (__DEV__ && dropped.length) console.log(`[activities] dropped ${dropped.length}`, dropped);
  return { activities, dropped };
}