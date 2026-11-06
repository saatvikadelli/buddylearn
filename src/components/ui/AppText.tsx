import { Text, type TextProps } from "react-native";

const FONT = {
  regular: "font-lexend",
  medium: "font-lexend-medium",
  semibold: "font-lexend-semibold",
  bold: "font-lexend-bold",
} as const;

const TONE = {
  default: "text-ink",
  soft: "text-ink-soft",
  muted: "text-ink-muted",
  inverse: "text-white",
  brand: "text-brand",
} as const;

type Props = TextProps & {
  weight?: keyof typeof FONT;
  tone?: keyof typeof TONE;
  className?: string;
};

/**
 * Always use this instead of <Text>. React Native cannot switch font weight with a
 * single font family, so each weight maps to its own Lexend font file.
 * Set size/spacing with className (e.g. "text-xl"). Choose colour with `tone`, not className.
 */
export function AppText({ weight = "regular", tone = "default", className = "", ...props }: Props) {
  return <Text className={`${FONT[weight]} ${TONE[tone]} ${className}`} {...props} />;
}
