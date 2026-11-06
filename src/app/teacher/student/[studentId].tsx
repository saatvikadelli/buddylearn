import { useLocalSearchParams } from "expo-router";
import { useMemo, useState } from "react";
import { View } from "react-native";

import { AppText } from "@/components/ui/AppText";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Header } from "@/components/ui/Header";
import { Icon } from "@/components/ui/Icon";
import { Screen } from "@/components/ui/Screen";
import { getClassInsights } from "@/data/analytics";
import { ProgressRow } from "@/features/dashboard/ProgressRow";
import { StatusPill } from "@/features/dashboard/StatusPill";
import { useTeacher } from "@/features/teacher/TeacherContext";
import { colors } from "@/theme";

export default function StudentDetailScreen() {
  const { studentId } = useLocalSearchParams<{ studentId: string }>();
  const { activeClass } = useTeacher();
  const [addedToPairs, setAddedToPairs] = useState(false);

  const insight = useMemo(
    () => (activeClass ? getClassInsights(activeClass).find((i) => i.student.id === studentId) : undefined),
    [activeClass, studentId],
  );

  if (!insight) {
    return (
      <Screen>
        <Header title="Child not found" />
      </Screen>
    );
  }
  const { student, status, strengths, ideas, notices, weekSessions } = insight;

  return (
    <Screen scroll>
      <Header title={student.name} step={activeClass?.name} />

      <Card tone="lavender" className="gap-3.5 rounded-hero px-5 py-5">
        <View className="flex-row items-center gap-3.5">
          <Avatar name={student.name} tone={student.tone} size={64} />
          <View className="flex-1 gap-1.5">
            <AppText weight="semibold" className="text-[20px] leading-7">
              What {student.name} does well
            </AppText>
            <View className="flex-row">
              <StatusPill status={status} />
            </View>
          </View>
        </View>
        <View className="flex-row flex-wrap gap-2">
          {strengths.map((s) => (
            <View key={s} className="rounded-full border-2 border-surface bg-surface px-3.5 py-2">
              <AppText weight="medium" className="text-[15px] capitalize">
                {s}
              </AppText>
            </View>
          ))}
        </View>
      </Card>

      <AppText weight="semibold" className="text-xl">
        Progress by idea
      </AppText>
      <Card className="gap-4 px-[18px] py-4">
        {ideas.map((idea) => (
          <ProgressRow key={idea.title} label={idea.title} percent={idea.percent} />
        ))}
        <AppText tone="muted" className="text-sm">
          Practised on {weekSessions} {weekSessions === 1 ? "day" : "days"} this week.
        </AppText>
      </Card>

      <AppText weight="semibold" className="text-xl">
        What we noticed
      </AppText>
      <Card tone="butter" className="gap-3">
        {notices.map((n) => (
          <View key={n} className="flex-row items-start gap-3">
            <Icon name="lightbulb" size={22} color={colors.ink} />
            <AppText className="flex-1 text-base leading-6">{n}</AppText>
          </View>
        ))}
      </Card>

      <View className="min-h-4 flex-1" />
      {/* TODO: add this child to the real pairing list when the Buddy pairs screen exists */}
      <Button
        icon={addedToPairs ? "check" : "users"}
        variant={addedToPairs ? "secondary" : "primary"}
        label={addedToPairs ? "Added to Friday pairs" : "Add to Friday pairs"}
        onPress={() => setAddedToPairs((v) => !v)}
      />
    </Screen>
  );
}