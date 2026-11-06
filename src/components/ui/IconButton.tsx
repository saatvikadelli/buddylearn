import { Pressable, type PressableProps } from "react-native";

import { colors } from "@/theme";

import { Icon } from "./Icon";
import type { IconName } from "./icons";

type Props = Omit<PressableProps, "children"> & {
  icon: IconName;
  label: string; // read aloud by screen readers
};

/** Round outlined icon button (back, settings...). 52px so it is easy to tap. */
export function IconButton({ icon, label, ...props }: Props) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      className="h-[52px] w-[52px] items-center justify-center rounded-full border-2 border-ink bg-surface active:opacity-80"
      {...props}
    >
      <Icon name={icon} size={24} color={colors.ink} />
    </Pressable>
  );
}
