import { useLocalSearchParams, useRouter } from "expo-router";
import { View } from "react-native";

import { AppText } from "@/components/ui/AppText";
import { Button } from "@/components/ui/Button";
import { Card, type CardTone } from "@/components/ui/Card";
import { Header } from "@/components/ui/Header";
import { Icon } from "@/components/ui/Icon";
import { Screen } from "@/components/ui/Screen";
import { MATERIAL_LABEL, getActivity } from "@/data/activities";
import { getIdea } from "@/data/lessons";
import { parsePlan } from "@/features/activities/plan";
import { colors } from "@/theme";

const ROLE_TONES: CardTone[] = ["mint", "lavender", "sky", "butter"];

export default function ActivityCardScreen() {
  const router = useRouter();
  const { activityId, plan: planText } = useLocalSearchParams<{ activityId: string; plan?: string }>();
  const activity = getActivity(activityId);
  const plan = parsePlan(planText);

  if (!activity) {
    return (
      <Screen>
        <Header title="Activity not found" />
      </Screen>
    );
  }
  const params = { activityId: activity.id, plan: planText ?? "" };

  return (
    <Screen scroll>
      <Header title="Group activity" step={getIdea(plan.topicId)?.title} />

      <Card tone="peach" className="gap-2.5 rounded-hero px-5 py-5">
        <AppText weight="semibold" className="text-[28px] leading-9">
          {activity.title}
        </AppText>
        <AppText className="text-base leading-6">{activity.summary}</AppText>
        <View className="flex-row flex-wrap gap-1.5">
          {[
            `${activity.minutes} min`,
            `Goal: ${plan.goal}`,
            activity.needs.length ? activity.needs.map((m) => MATERIAL_LABEL[m]).join(", ") : "No materials",
          ].map((t) => (
            <View key={t} className="rounded-full bg-surface px-3 py-1">
              <AppText weight="medium" className="text-sm">
                {t}
              </AppText>
            </View>
          ))}
        </View>
      </Card>

      {plan.local ? (
        <Card className="flex-row items-start gap-3 px-4 py-3">
          <Icon name="mapPin" size={22} color={colors.ink} />
          <AppText className="flex-1 text-sm leading-5">{activity.localNote}</AppText>
        </Card>
      ) : null}

      <AppText weight="semibold" className="text-base">
        Roles: every one is needed to finish
      </AppText>
      <View className="-mx-1 flex-row flex-wrap">
        {activity.roles.map((role, i) => (
          <View key={role.name} className="w-1/2 p-1">
            <Card tone={ROLE_TONES[i % ROLE_TONES.length]} className="min-h-[96px] gap-1 px-3.5 py-3">
              <AppText weight="semibold" className="text-[17px]">
                {role.name}
              </AppText>
              <AppText className="text-sm leading-5">{role.job}</AppText>
            </Card>
          </View>
        ))}
      </View>

      <Card
        onPress={() => router.push({ pathname: "/teacher/groups", params })}
        accessibilityLabel="Review the groups"
        className="flex-row items-center gap-3 px-4 py-3"
      >
        <Icon name="users" size={26} color={colors.ink} />
        <View className="flex-1">
          <AppText weight="semibold" className="text-base">
            Groups are ready
          </AppText>
          <AppText tone="muted" className="text-sm">
            Matched on different strengths
          </AppText>
        </View>
        <AppText weight="semibold" className="text-sm underline">
          Review
        </AppText>
      </Card>

      <Card className="flex-row items-start gap-3 px-4 py-3">
        <Icon name="shieldCheck" size={24} color={colors.ink} />
        <AppText className="flex-1 text-sm leading-5">
          Everyone does the same activity. Reading help is built into the cards, so no child stands out.
        </AppText>
      </Card>

      <View className="min-h-4 flex-1" />
      {/* Stacked, full width, main action first, so labels never wrap. */}
      <View className="gap-3">
        <Button
          icon="play"
          label="Start activity"
          onPress={() => router.push({ pathname: "/teacher/run/[activityId]", params })}
        />
        <Button variant="secondary" label="Show another" onPress={() => router.back()} />
      </View>
    </Screen>
  );
}