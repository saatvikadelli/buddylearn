import { Pressable, type PressableProps } from "react-native";

import { colors } from "@/theme";

import { AppText } from "./AppText";
import { Icon } from "./Icon";
import type { IconName } from "./icons";

type Props = Omit<PressableProps, "children" | "className"> & {
  label: string;
  variant?: "primary" | "secondary";
  /** Optional icon shown before the label. */
  icon?: IconName;
  /** Taller (72px) for the one main action on a card. */
  large?: boolean;
  className?: string;
};

export function Button({ label, variant = "primary", icon, large = false, className = "", ...props }: Props) {
  const primary = variant === "primary";
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      className={`flex-row items-center justify-center gap-3 rounded-full px-6 active:opacity-80 ${
        large ? "h-[72px]" : "h-16"
      } ${primary ? "bg-ink" : "border-2 border-ink bg-surface"} ${className}`}
      {...props}
    >
      {icon ? <Icon name={icon} size={24} color={primary ? colors.surface : colors.ink} /> : null}
      {/* Always one line: a long label shrinks a little (to 85% at most) instead of wrapping. */}
      <AppText
        weight="semibold"
        tone={primary ? "inverse" : "default"}
        numberOfLines={1}
        adjustsFontSizeToFit
        minimumFontScale={0.85}
        className={`shrink ${large ? "text-2xl" : "text-xl"}`}
      >
        {label}
      </AppText>
    </Pressable>
  );
}