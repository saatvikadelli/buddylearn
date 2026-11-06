import { Pressable, View, type PressableProps, type ViewProps } from "react-native";

export type CardTone = "white" | "mint" | "blush" | "butter" | "lavender" | "sky" | "peach";

// Full class names (not built from pieces) so Tailwind can find them.
const TONE: Record<CardTone, string> = {
  white: "border-line bg-surface",
  mint: "border-ink bg-mint",
  blush: "border-ink bg-blush",
  butter: "border-ink bg-butter",
  lavender: "border-ink bg-lavender",
  sky: "border-ink bg-sky",
  peach: "border-ink bg-peach",
};

type Props = {
  tone?: CardTone;
  className?: string;
  /** If you pass onPress the whole card becomes tappable. */
  onPress?: PressableProps["onPress"];
  accessibilityLabel?: string;
} & ViewProps;

/**
 * The card used on Home, Books and every "hero" block.
 * Coloured cards always get a 2px ink outline. That is what keeps them clearly separate from
 * the page, even when the child picks a mint or sky screen colour.
 */
export function Card({ tone = "white", className = "", onPress, accessibilityLabel, children, ...rest }: Props) {
  const classes = `rounded-card border-2 p-[18px] ${TONE[tone]} ${className}`;

  if (onPress) {
    return (
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        onPress={onPress}
        className={`${classes} active:opacity-80`}
      >
        {children}
      </Pressable>
    );
  }
  return (
    <View className={classes} {...rest}>
      {children}
    </View>
  );
}