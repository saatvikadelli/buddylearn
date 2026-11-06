import type { SchoolClass, Student } from "@/data/mockClasses";

/**
 * DEMO ANALYTICS. These numbers are generated from the class list so the dashboard has something
 * to show. Later they come from what children actually do in the app (backend).
 */
export type Status = "on-track" | "nudge" | "ready";

export type StudentInsight = {
  student: Student;
  status: Status;
  strengths: string[];
  weekSessions: number;
  ideas: { title: string; percent: number }[];
  notices: string[];
};

export const STRENGTHS = [
  "visual reasoning",
  "speaking",
  "counting",
  "reading aloud",
  "drawing",
  "spotting patterns",
  "explaining",
  "building models",
  "memory",
  "letters and words",
];


const PATTERN: Status[] = ["nudge", "on-track", "ready", "on-track", "nudge", "on-track", "ready"];

const IDEA_TITLES = ["Halves and quarters", "Equivalent fractions", "Comparing fractions"];
    /** Which lesson idea each title above is (see lessons.ts). */
    const IDEA_IDS = ["maths-2-i1", "maths-2-i2", "maths-2-i2"];
const PERCENTS: Record<Status, number[]> = {
  ready: [95, 82, 55],
  "on-track": [86, 56, 22],
  nudge: [62, 34, 6],
};

const NOTICES: Record<Status, string[]> = {
  nudge: [
    "Swaps the top and bottom number in a few questions.",
    "Learns best with pictures and audio.",
    "Needs a short break after two wrong answers.",
  ],
  "on-track": ["Steady progress. Practises most days.", "Learns best with a story first."],
  ready: ["Explains ideas well out loud.", "A good buddy for someone who is still practising."],
};

export function getClassInsights(schoolClass: SchoolClass): StudentInsight[] {
  return schoolClass.students.map((student, i) => {
    const status = PATTERN[i % PATTERN.length];
    return {
      student,
      status,
      strengths: [STRENGTHS[(i * 3) % STRENGTHS.length], STRENGTHS[(i * 3 + 4) % STRENGTHS.length]],
      weekSessions: status === "nudge" ? i % 2 : 2 + (i % 3),
      ideas: IDEA_TITLES.map((title, k) => ({ title, percent: PERCENTS[status][k] })),
      notices: NOTICES[status],
    };
  });
}

export function summarise(insights: StudentInsight[]) {
  const count = (s: Status) => insights.filter((x) => x.status === s).length;
  const ideaAverage = (k: number) =>
    insights.length
      ? Math.round(insights.reduce((n, x) => n + x.ideas[k].percent, 0) / insights.length)
      : 0;

  // The idea the class finds hardest (lowest average, ignoring the very last "just starting" one)
  const hardest = [0, 1].reduce((a, b) => (ideaAverage(a) <= ideaAverage(b) ? a : b));

  return {
    practised: insights.filter((x) => x.weekSessions > 0).length,
    nudge: count("nudge"),
    ready: count("ready"),
    onTrack: count("on-track"),
    suggestion: {
      idea: IDEA_TITLES[hardest],
      average: ideaAverage(hardest),
      practising: count("on-track"),
      needHelp: count("nudge"),
          ideaId: IDEA_IDS[hardest],
    },
    chapterAverage: Math.round((ideaAverage(0) + ideaAverage(1) + ideaAverage(2)) / 3),
  };
}

export const STATUS_META: Record<Status, { label: string }> = {
  "on-track": { label: "On track" },
  nudge: { label: "Needs a nudge" },
  ready: { label: "Ready to help" },
};