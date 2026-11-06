/**
 * MISTAKES each idea's wrong answers are built to catch.
 * The AI must tag every wrong option with one of these ids. It cannot invent new ones.
 * `label` is teacher-facing (Review screen, "Most common mistakes"). Children never see it.
 * Add a list here before generating questions for a new idea.
 */
export type Mistake = { id: string; label: string };

export const MISTAKES: Record<string, Mistake[]> = {
  "maths-1-i1": [
    { id: "face-value", label: "Reads a digit as itself, not by its place" },
    { id: "skips-zero-place", label: "Drops or moves a zero place" },
    { id: "compares-wrong-place", label: "Compares the wrong place first" },
  ],
  "maths-2-i1": [
    { id: "more-pieces-bigger", label: "Thinks more pieces means bigger pieces" },
    { id: "unequal-parts", label: "Calls unequal parts halves or quarters" },
    { id: "wrong-count", label: "Miscounts how many parts make a whole" },
  ],
  "maths-2-i2": [
    { id: "adds-top-bottom", label: "Adds the same number to the top and bottom" },
    { id: "swaps-top-bottom", label: "Swaps the top and bottom number" },
    { id: "changes-one-number", label: "Changes only the top or only the bottom number" },
    { id: "bigger-bottom-bigger", label: "Thinks a bigger bottom number means a bigger piece" },
  ],
  "evs-1-i1": [
    { id: "clear-means-safe", label: "Thinks clear-looking water is always safe" },
    { id: "cold-means-safe", label: "Thinks cold water is clean water" },
    { id: "additive-cleans", label: "Thinks adding sugar or salt cleans water" },
    { id: "drinks-hot", label: "Forgets boiled water must cool first" },
  ],
};

export const getMistakes = (ideaId: string) => MISTAKES[ideaId] ?? [];
export const getMistake = (ideaId: string, mistakeId: string) =>
  getMistakes(ideaId).find((m) => m.id === mistakeId) ?? null;