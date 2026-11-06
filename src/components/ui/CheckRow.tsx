import type { ReactNode } from "react";
import { Pressable, View } from "react-native";

import { colors } from "@/theme";

import { Icon } from "./Icon";

type Props = { checked: boolean; onToggle: () => void; children: ReactNode };

export function CheckRow({ checked, onToggle, children }: Props) {
  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityState={{ checked }}
      onPress={onToggle}
      className="flex-row items-start gap-3 rounded-card border-2 border-ink bg-mint p-4"
    >
      <View
        className={`mt-0.5 h-7 w-7 items-center justify-center rounded-lg border-2 border-ink ${
          checked ? "bg-ink" : "bg-surface"
        }`}
      >
        {checked ? <Icon name="check" size={18} color={colors.surface} /> : null}
      </View>
      <View className="flex-1">{children}</View>
    </Pressable>
  );
}