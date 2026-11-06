import { Pressable, View } from "react-native";

import { AppText } from "./AppText";

type Props = { title: string; actionLabel?: string; onAction?: () => void };

export function SectionTitle({ title, actionLabel, onAction }: Props) {
  return (
    <View className="flex-row items-center justify-between">
      <AppText weight="semibold" className="text-xl">
        {title}
      </AppText>
      {actionLabel && onAction ? (
        <Pressable accessibilityRole="link" onPress={onAction} className="py-2 pl-3">
          <AppText weight="semibold" className="text-[15px] underline">
            {actionLabel}
          </AppText>
        </Pressable>
      ) : null}
    </View>
  );
}