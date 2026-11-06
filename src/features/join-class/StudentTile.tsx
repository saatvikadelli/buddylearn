import { Pressable, View } from "react-native";

import { AppText } from "@/components/ui/AppText";
import { Avatar } from "@/components/ui/Avatar";
import { Icon } from "@/components/ui/Icon";
import type { Student } from "@/data/mockClasses";
import { colors } from "@/theme";

type Props = {
  student: Student;
  selected: boolean;
  onPress: () => void;
};

/** One child's name tile. Three of these fit in a row (see join-class.tsx). */
export function StudentTile({ student, selected, onPress }: Props) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={student.name}
      accessibilityState={{ selected }}
      onPress={onPress}
      className={`items-center gap-2 rounded-3xl bg-surface px-1.5 py-3 active:opacity-80 ${
        selected ? "border-[3px] border-ink" : "border-2 border-line"
      }`}
    >
      <Avatar name={student.name} tone={student.tone} />
      <AppText weight={selected ? "semibold" : "medium"} className="text-base">
        {student.name}
      </AppText>

      {selected ? (
        <View className="absolute -right-2 -top-2 h-7 w-7 items-center justify-center rounded-full bg-ink">
          <Icon name="check" size={16} color={colors.surface} />
        </View>
      ) : null}
    </Pressable>
  );
}
