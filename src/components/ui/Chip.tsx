import { Pressable, type PressableProps } from "react-native";

import { colors } from "@/theme";

import { AppText } from "./AppText";
import { Icon } from "./Icon";
import type { IconName } from "./icons";

type Props = Omit<PressableProps, "children"> & {
  label: string;
  icon?: IconName;
  selected?: boolean;
};

export function Chip({ label, icon, selected = false, ...props }: Props) {
  return (
    <Pressable
      accessibilityRole="button"
      className={`h-[46px] flex-row items-center gap-2 rounded-full border-2 px-[18px] active:opacity-80 ${
        selected ? "border-ink bg-ink" : "border-line bg-surface"
      }`}
      {...props}
    >
      {icon ? <Icon name={icon} size={20} color={selected ? colors.surface : colors.ink} /> : null}
      <AppText weight="medium" tone={selected ? "inverse" : "default"} className="text-[15px]">
        {label}
      </AppText>
    </Pressable>
  );
}
