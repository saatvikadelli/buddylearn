import { useLocalSearchParams, useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { View } from "react-native";

import { AppText } from "@/components/ui/AppText";
import { Avatar } from "@/components/ui/Avatar";
import { Card } from "@/components/ui/Card";
import { Chip } from "@/components/ui/Chip";
import { Header } from "@/components/ui/Header";
import { Screen } from "@/components/ui/Screen";
import { STATUS_META, getClassInsights, type Status } from "@/data/analytics";
import { ClassSwitcher } from "@/features/dashboard/ClassSwitcher";
import { StatusPill } from "@/features/dashboard/StatusPill";
import { useTeacher } from "@/features/teacher/TeacherContext";

type Filter = "all" | Status;
const FILTERS: Filter[] = ["all", "nudge", "on-track", "ready"];

export default function ClassScreen() {
  const router = useRouter();
  const { filter: startFilter } = useLocalSearchParams<{ filter?: Filter }>();
  const { activeClass } = useTeacher();
  const [filter, setFilter] = useState<Filter>(startFilter ?? "all");

  const insights = useMemo(() => (activeClass ? getClassInsights(activeClass) : []), [activeClass]);
  const shown = filter === "all" ? insights : insights.filter((i) => i.status === filter);

  return (
    <Screen scroll tabBar>
      <Header
        title={activeClass?.name ?? "Class"}
        step={activeClass ? `${activeClass.students.length} students` : undefined}
        hideBack
      />
      <ClassSwitcher />

      <View className="flex-row flex-wrap gap-2">
        {FILTERS.map((f) => (
          <Chip
            key={f}
            label={f === "all" ? "All" : STATUS_META[f].label}
            selected={filter === f}
            onPress={() => setFilter(f)}
          />
        ))}
      </View>

      {!activeClass ? (
        <AppText tone="soft" className="text-base">
          No class yet. Set one up from Home.
        </AppText>
      ) : shown.length === 0 ? (
        <AppText tone="soft" className="text-base">
          Nobody here right now.
        </AppText>
      ) : (
        <View className="gap-2.5">
          {shown.map(({ student, status, strengths }) => (
            <Card
              key={student.id}
              onPress={() =>
                router.push({ pathname: "/teacher/student/[studentId]", params: { studentId: student.id } })
              }
              accessibilityLabel={`${student.name}, ${STATUS_META[status].label}`}
              className="flex-row items-center gap-3 px-3 py-3"
            >
              <Avatar name={student.name} tone={student.tone} size={48} />
              <View className="flex-1 gap-1.5">
                <AppText weight="semibold" className="text-[17px]">
                  {student.name}
                </AppText>
                <AppText tone="muted" className="text-sm leading-5">
                  Strong: {strengths.join(", ")}
                </AppText>
                <View className="flex-row">
                  <StatusPill status={status} />
                </View>
              </View>
            </Card>
          ))}
        </View>
      )}
    </Screen>
  );
}