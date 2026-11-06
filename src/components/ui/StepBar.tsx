import { View } from "react-native";

type Props = { total: number; current: number };

export function StepBar({ total, current }: Props) {
  return (
    <View className="flex-row gap-1.5" accessibilityLabel={`Step ${current} of ${total}`}>
      {Array.from({ length: total }, (_, i) => (
        <View key={i} className={`h-2 flex-1 rounded-full ${i < current ? "bg-ink" : "bg-line-strong"}`} />
      ))}
    </View>
  );
}