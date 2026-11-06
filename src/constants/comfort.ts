export const SCREEN_TINTS = [
  { id: "cream", label: "Warm cream", color: "#F7F6F2" },
  { id: "white", label: "White", color: "#FFFFFF" },
  { id: "mint", label: "Soft mint", color: "#DDF2E8" },
  { id: "sky", label: "Soft sky", color: "#DCEEFA" },
] as const;

export type TintId = (typeof SCREEN_TINTS)[number]["id"];

export type ComfortSettings = {
  readAloud: boolean;
  biggerLetters: boolean;
  fewerWords: boolean;
  shortSessions: boolean;
  tint: TintId;
};

export const DEFAULT_COMFORT: ComfortSettings = {
  readAloud: true,
  biggerLetters: true,
  fewerWords: false,
  shortSessions: true,
  tint: "cream",
};