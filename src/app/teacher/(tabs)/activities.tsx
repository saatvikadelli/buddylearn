import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, View } from "react-native";

import { AppText } from "@/components/ui/AppText";
import { Button } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Chip";
import { Header } from "@/components/ui/Header";
import { Icon } from "@/components/ui/Icon";
import { Screen } from "@/components/ui/Screen";
import { MATERIAL_LABEL, type Material } from "@/data/activities";
import { IDEAS } from "@/data/lessons";
import { findChapter } from "@/data/syllabus";
import { DEFAULT_PLAN, GOALS, TIMES, serializePlan, type Plan } from "@/features/activities/plan";
import { colors } from "@/theme";

const MATERIALS = Object.keys(MATERIAL_LABEL) as Material[];

export default function ActivitiesScreen() {
  const router = useRouter();
  const { topicId } = useLocalSearchParams<{ topicId?: string }>();
  const [plan, setPlan] = useState<Plan>({ ...DEFAULT_PLAN, topicId: topicId ?? DEFAULT_PLAN.topicId });

  const set = <K extends keyof Plan>(key: K, value: Plan[K]) => setPlan((p) => ({ ...p, [key]: value }));
  const toggleMaterial = (m: Material) =>
    set("materials", plan.materials.includes(m) ? plan.materials.filter((x) => x !== m) : [...plan.materials, m]);

  return (
    <Screen scroll tabBar>
      <Header title="Plan an activity" step="Group activities" hideBack />

      <AppText weight="semibold" className="text-base">
        Topic
      </AppText>
      <View className="gap-2">
        {IDEAS.map((idea) => {
          const on = idea.id === plan.topicId;
          const chapter = findChapter(idea.chapterId);
          return (
            <Pressable
              key={idea.id}
              accessibilityRole="radio"
              accessibilityState={{ selected: on }}
              onPress={() => set("topicId", idea.id)}
              className={`flex-row items-center gap-3 rounded-card px-4 py-3 ${
                on ? "border-[3px] border-ink bg-blush" : "border-2 border-line bg-surface"
              }`}
            >
              <View className="flex-1">
                <AppText weight="semibold" className="text-base">
                  {idea.title}
                </AppText>
                <AppText tone="muted" className="text-sm">
                  {chapter?.book.subject} · {chapter?.chapter.title}
                </AppText>
              </View>
              {on ? <Icon name="check" size={22} color={colors.ink} /> : null}
            </Pressable>
          );
        })}
      </View>

      <AppText weight="semibold" className="text-base">
        Goal
      </AppText>
      <View className="flex-row flex-wrap gap-2">
        {GOALS.map((g) => (
          <Chip key={g} label={g} selected={plan.goal === g} onPress={() => set("goal", g)} />
        ))}
      </View>

      <View className="flex-row items-center justify-between">
        <AppText weight="semibold" className="text-base">
          Group size
        </AppText>
        <View className="flex-row items-center gap-3">
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Smaller groups"
            onPress={() => set("groupSize", Math.max(2, plan.groupSize - 1))}
            className="h-[46px] w-[46px] items-center justify-center rounded-full border-2 border-line-strong bg-surface"
          >
            <Icon name="minus" size={20} color={colors.ink} />
          </Pressable>
          <AppText weight="semibold" className="min-w-[28px] text-center text-2xl">
            {plan.groupSize}
          </AppText>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Bigger groups"
            onPress={() => set("groupSize", Math.min(6, plan.groupSize + 1))}
            className="h-[46px] w-[46px] items-center justify-center rounded-full border-2 border-line-strong bg-surface"
          >
            <Icon name="plus" size={20} color={colors.ink} />
          </Pressable>
        </View>
      </View>

      <AppText weight="semibold" className="text-base">
        Time
      </AppText>
      <View className="flex-row gap-2">
        {TIMES.map((t) => (
          <Chip key={t} label={`${t} min`} selected={plan.minutes === t} onPress={() => set("minutes", t)} />
        ))}
      </View>

      <AppText weight="semibold" className="text-base">
        What do you have?
      </AppText>
      <View className="flex-row flex-wrap gap-2">
        {MATERIALS.map((m) => (
          <Chip key={m} label={MATERIAL_LABEL[m]} selected={plan.materials.includes(m)} onPress={() => toggleMaterial(m)} />
        ))}
        <Chip label="Nothing" selected={plan.materials.length === 0} onPress={() => set("materials", [])} />
      </View>

      <Pressable
        accessibilityRole="switch"
        accessibilityState={{ checked: plan.local }}
        onPress={() => set("local", !plan.local)}
        className="flex-row items-center gap-3 rounded-card border-2 border-line bg-surface px-4 py-3"
      >
        <View className="flex-1">
          <AppText weight="semibold" className="text-base">
            Make it local
          </AppText>
          <AppText tone="muted" className="text-sm">
            Use shops, roti and school life
          </AppText>
        </View>
        <View className={`rounded-[14px] px-3 py-1 ${plan.local ? "bg-ink" : "bg-line"}`}>
          <AppText weight="semibold" tone={plan.local ? "inverse" : "default"} className="text-sm">
            {plan.local ? "On" : "Off"}
          </AppText>
        </View>
      </Pressable>

      <View className="min-h-4 flex-1" />
      <Button
        icon="sparkles"
        label="Make my activity"
        onPress={() => router.push({ pathname: "/teacher/activity-options", params: { plan: serializePlan(plan) } })}
      />
    </Screen>
  );
}