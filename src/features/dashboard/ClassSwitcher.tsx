import { ScrollView } from "react-native";

import { Chip } from "@/components/ui/Chip";
import { useTeacher } from "@/features/teacher/TeacherContext";

/** Chips to switch class. Hidden when the teacher has only one class. */
export function ClassSwitcher() {
  const { classes, activeClass, setActiveClass } = useTeacher();
  if (classes.length < 2) return null;
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} className="-mx-5 flex-grow-0" contentContainerClassName="gap-2 px-5">
      {classes.map((c) => (
        <Chip key={c.code} label={c.name} selected={c.code === activeClass?.code} onPress={() => setActiveClass(c.code)} />
      ))}
    </ScrollView>
  );
}