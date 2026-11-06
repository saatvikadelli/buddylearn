import tokens from "./tokens.json";

/**
 * Raw colour values for places where a Tailwind class cannot be used
 * (SVG fills, StatusBar, navigation options). For styling views and text,
 * prefer Tailwind classes such as `bg-mint` or `text-ink-soft`.
 */
export const colors = {
  canvas: tokens.colors.canvas,
  surface: tokens.colors.surface,
  track: tokens.colors.track,
  ink: tokens.colors.ink.DEFAULT,
  inkSoft: tokens.colors.ink.soft,
  inkMuted: tokens.colors.ink.muted,
  line: tokens.colors.line.DEFAULT,
  lineStrong: tokens.colors.line.strong,
  mint: tokens.colors.mint,
  peach: tokens.colors.peach,
  blush: tokens.colors.blush,
  lavender: tokens.colors.lavender,
  butter: tokens.colors.butter,
  sky: tokens.colors.sky,
  gold: tokens.colors.gold,
  brand: tokens.colors.brand.DEFAULT,
  brandDark: tokens.colors.brand.dark,
  clay: tokens.colors.clay,
} as const;

/** Font family names registered in app/_layout.tsx (Lexend, dyslexia-friendly). */
export const fonts = {
  regular: "Lexend_400Regular",
  medium: "Lexend_500Medium",
  semibold: "Lexend_600SemiBold",
  bold: "Lexend_700Bold",
} as const;
