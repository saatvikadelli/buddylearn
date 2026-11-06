import { useLocalSearchParams } from "expo-router";
import { useMemo, useState } from "react";
import { View } from "react-native";

import { AppText } from "@/components/ui/AppText";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Header } from "@/components/ui/Header";
import { Screen } from "@/components/ui/Screen";
import { getActivity } from "@/data/activities";
import { getClassInsights } from "@/data/analytics";
// import { buildGroups } from "@/features/activities/groups";
import { parsePlan } from "@/features/activities/plan";
import { useTeacher } from "@/features/teacher/TeacherContext";
import { buildGroups } from "@/features/activities/group";

export default function GroupsScreen() {
  const { activityId, plan: planText } = useLocalSearchParams<{ activityId: string; plan?: string }>();
  const { activeClass } = useTeacher();
  const activity = getActivity(activityId);
  const plan = parsePlan(planText);
  const [shuffle, setShuffle] = useState(0);
  const [sent, setSent] = useState(false);

  const groups = useMemo(
    () =>
      activity && activeClass
        ? buildGroups(getClassInsights(activeClass), plan.groupSize, activity.roles, shuffle)
        : [],
    [activity, activeClass, plan.groupSize, shuffle],
  );

  return (
    <Screen scroll>
      <Header title="Groups" step={activity?.title} />

      <Card tone="mint" className="px-[18px] py-3.5">
        <AppText className="text-base leading-6">
          Groups mix strengths, and each role matches something the child is good at. Nobody is always the helper.
        </AppText>
      </Card>

      {groups.length === 0 ? (
        <AppText tone="soft" className="text-base">
          Set up a class first, then groups appear here.
        </AppText>
      ) : (
        groups.map((group) => (
          <Card key={group.number} className="gap-3">
            <AppText weight="semibold" className="text-lg">
              Group {group.number}
            </AppText>
            {group.members.map((m) => (
              <View key={m.student.id} className="flex-row items-center gap-3">
                <Avatar name={m.student.name} tone={m.student.tone} size={44} />
                <View className="flex-1">
                  <AppText weight="semibold" className="text-base">
                    {m.student.name}
                  </AppText>
                  <AppText tone="muted" className="text-sm capitalize">
                    {m.reason}
                  </AppText>
                </View>
                <View className="rounded-full bg-lavender px-3 py-1.5">
                  <AppText weight="semibold" className="text-sm">
                    {m.role.name}
                  </AppText>
                </View>
              </View>
            ))}
          </Card>
        ))
      )}

      <View className="min-h-4 flex-1" />
      <View className="flex-row gap-3">
        <Button
          variant="secondary"
          icon="shuffle"
          label="Shuffle"
          className="flex-1 px-0"
          onPress={() => {
            setShuffle((n) => n + 1);
            setSent(false);
          }}
        />
        {/* TODO: send the groups to the children's phones (backend) */}
        <Button
          label={sent ? "Sent" : "Send to class"}
          icon={sent ? "check" : undefined}
          className="flex-1 px-0"
          onPress={() => setSent(true)}
        />
      </View>
    </Screen>
  );
}