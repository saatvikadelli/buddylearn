import { useLocalSearchParams, useRouter } from "expo-router";
import { View } from "react-native";

import { AppText } from "@/components/ui/AppText";
import { Button } from "@/components/ui/Button";
import { Card, type CardTone } from "@/components/ui/Card";
import { Header } from "@/components/ui/Header";
import { Icon } from "@/components/ui/Icon";
import { Screen } from "@/components/ui/Screen";
import { MATERIAL_LABEL } from "@/data/activities";
import { getIdea } from "@/data/lessons";
import { parsePlan } from "@/features/activities/plan";
import { useActivityIdeas } from "@/features/activities/useActivityIdeas";
import { colors } from "@/theme";

const TONES: CardTone[] = ["peach", "mint", "lavender"];

/**
 * "Three ideas for you": buddy-session activities written by the AI for the teacher's plan
 * (topic, goal, group size, time, materials, local). "Surprise me" asks for three new ones.
 */
export default function ActivityOptionsScreen() {
  const router = useRouter();
  const { plan: planText } = useLocalSearchParams<{ plan?: string }>();
  const plan = parsePlan(planText);
  const idea = getIdea(plan.topicId);
  const ideas = useActivityIdeas(plan);

  const open = (activityId: string) =>
    router.push({ pathname: "/teacher/activity/[activityId]", params: { activityId, plan: planText ?? "" } });

  const options = ideas.activities.map((activity) => {
    const missing = activity.needs.filter((m) => !plan.materials.includes(m));
    const tooLong = activity.minutes > plan.minutes;
    return { activity, missing, tooLong, fits: missing.length === 0 && !tooLong };
  });

  return (
    <Screen scroll>
      <Header title="Three ideas for you" step={`${idea?.title ?? "Activity"} · ${plan.minutes} min`} />

      {ideas.loading ? (
        <Card tone="butter" className="items-center gap-3 py-10">
          <Icon name="sparkles" size={40} color={colors.ink} />
          <AppText weight="semibold" className="text-center text-xl">
            Writing 3 activities for your class…
          </AppText>
          <AppText tone="soft" className="text-center text-base">
            Groups of {plan.groupSize} · {plan.goal} · {plan.minutes} min
          </AppText>
        </Card>
      ) : options.length === 0 ? (
        <Card tone="butter" className="gap-2">
          <AppText weight="semibold" className="text-xl">
            No activity for this topic yet
          </AppText>
          <AppText className="text-base leading-6">Please try again in a minute, or pick another topic.</AppText>
        </Card>
      ) : (
        options.map(({ activity, missing, tooLong, fits }, i) => (
          <Card
            key={activity.id}
            tone={TONES[i % TONES.length]}
            onPress={() => open(activity.id)}
            accessibilityLabel={`${activity.title}, ${activity.minutes} minutes`}
            className="gap-2"
          >
            <View className="flex-row items-center justify-between gap-2">
              <AppText weight="semibold" className="flex-1 text-[22px]">
                {activity.title}
              </AppText>
              <View className="rounded-full bg-surface px-3 py-1">
                <AppText weight="medium" className="text-xs">
                  {activity.format}
                </AppText>
              </View>
            </View>
            <AppText className="text-[15px] leading-6">{activity.summary}</AppText>
            <View className="flex-row flex-wrap gap-1.5">
              <Tag text={`${activity.minutes} min`} />
              <Tag
                text={activity.needs.length ? activity.needs.map((m) => MATERIAL_LABEL[m]).join(", ") : "No materials"}
              />
              <Tag text={`Groups of ${activity.roles.length}`} />
            </View>
            {fits ? null : (
              <View className="flex-row items-center gap-2">
                <Icon name="circleAlert" size={18} color={colors.ink} />
                <AppText weight="medium" className="flex-1 text-sm">
                  {[
                    tooLong ? `Needs ${activity.minutes} min` : "",
                    missing.length ? `You need: ${missing.map((m) => MATERIAL_LABEL[m]).join(", ")}` : "",
                  ]
                    .filter(Boolean)
                    .join(". ")}
                </AppText>
              </View>
            )}
          </Card>
        ))
      )}

      {__DEV__ && ideas.from ? (
        <AppText tone="muted" className="text-center text-xs">
          dev · activities from {ideas.from}
        </AppText>
      ) : null}

      <View className="min-h-4 flex-1" />
      {/* Stacked, full width: AI titles can be long, and labels must never wrap. */}
      <View className="gap-3">
        <Button
          label={options[0] ? `Open ${options[0].activity.title}` : "Change my plan"}
          className={ideas.loading ? "opacity-40" : ""}
          disabled={ideas.loading}
          onPress={() => (options[0] ? open(options[0].activity.id) : router.back())}
        />
        <Button
          variant="secondary"
          icon="sparkles"
          label="Surprise me"
          className={ideas.loading ? "opacity-40" : ""}
          disabled={ideas.loading}
          onPress={ideas.surprise}
        />
      </View>
    </Screen>
  );
}

function Tag({ text }: { text: string }) {
  return (
    <View className="rounded-full bg-surface px-3 py-1">
      <AppText weight="medium" className="text-sm">
        {text}
      </AppText>
    </View>
  );
}