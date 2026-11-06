import { Pressable, View } from "react-native";

import { AppText } from "@/components/ui/AppText";
import { Icon } from "@/components/ui/Icon";
import type { IconName } from "@/components/ui/icons";
import { colors } from "@/theme";

type Props = {
  label: string;
  value: boolean;
  onToggle: () => void;
  icon?: IconName; // show an icon...
  glyph?: string; // ...or a short text such as "Aa"
};

export function ComfortToggle({ label, value, onToggle, icon, glyph }: Props) {
  return (
    <Pressable
      accessibilityRole="switch"
      accessibilityLabel={label}
      accessibilityState={{ checked: value }}
      onPress={onToggle}
      className={`h-[118px] justify-between rounded-card bg-surface p-4 active:opacity-80 ${
        value ? "border-[3px] border-ink" : "border-2 border-line"
      }`}
    >
      <View className="flex-row items-center justify-between">
        {icon ? (
          <Icon name={icon} size={30} color={colors.ink} />
        ) : (
          <AppText weight="bold" className="text-[30px] leading-[34px]">
            {glyph}
          </AppText>
        )}
        <View className={`rounded-[14px] px-3 py-1 ${value ? "bg-ink" : "bg-line"}`}>
          <AppText weight="semibold" tone={value ? "inverse" : "default"} className="text-sm">
            {value ? "On" : "Off"}
          </AppText>
        </View>
      </View>
      <AppText weight="semibold" className="text-[17px] leading-[22px]">
        {label}
      </AppText>
    </Pressable>
  );
}