import { View } from "react-native";

import { AppText } from "@/components/ui/AppText";

const word = (percent: number) => (percent >= 80 ? "Got it" : percent >= 30 ? "Practising" : "Just starting");

/** Label, a word for the level, and a bar. */
export function ProgressRow({ label, percent }: { label: string; percent: number }) {
  return (
    <View className="gap-1.5" accessibilityLabel={`${label}: ${word(percent)}, ${percent} percent`}>
      <View className="flex-row items-center justify-between">
        <AppText weight="semibold" className="text-base">
          {label}
        </AppText>
        <AppText weight="semibold" className="text-sm">
          {word(percent)}
        </AppText>
      </View>
      <View className="h-3 rounded-full bg-line">
        <View className="h-3 rounded-full bg-ink" style={{ width: `${percent}%` }} />
      </View>
    </View>
  );
}