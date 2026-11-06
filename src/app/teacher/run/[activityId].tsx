import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { View } from "react-native";

import { AppText } from "@/components/ui/AppText";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Chip } from "@/components/ui/Chip";
import { Header } from "@/components/ui/Header";
import { Icon } from "@/components/ui/Icon";
import { Screen } from "@/components/ui/Screen";
import { getActivity } from "@/data/activities";
import { colors } from "@/theme";

type Adjust = "tooHard" | "tooEasy" | "noisy";
const ADJUST: { id: Adjust; label: string }[] = [
  { id: "tooHard", label: "Too hard" },
  { id: "tooEasy", label: "Too easy" },
  { id: "noisy", label: "Class is noisy" },
];

export default function RunScreen() {
  const router = useRouter();
  const { activityId } = useLocalSearchParams<{ activityId: string }>();
  const activity = getActivity(activityId);
  const [step, setStep] = useState(0);
  const [tip, setTip] = useState<Adjust | null>(null);

  if (!activity) {
    return (
      <Screen>
        <Header title="Activity not found" />
      </Screen>
    );
  }
  const last = step === activity.steps.length - 1;

  return (
    <Screen scroll>
      <Header title="Run it in class" step={`${activity.title} · Step ${step + 1} of ${activity.steps.length}`} />

      <View className="gap-2.5">
        {activity.steps.map((s, i) => {
          const done = i < step;
          const current = i === step;
          return (
            <Card
              key={s.title}
              tone={current ? "butter" : "white"}
              className="flex-row items-start gap-3 px-3.5 py-3"
              style={current ? { borderWidth: 3 } : undefined}
            >
              <View className={`h-[34px] w-[34px] items-center justify-center rounded-full ${done || current ? "bg-ink" : "bg-track"}`}>
                {done ? (
                  <Icon name="check" size={18} color={colors.surface} />
                ) : (
                  <AppText weight="semibold" tone={current ? "inverse" : "default"} className="text-[15px]">
                    {i + 1}
                  </AppText>
                )}
              </View>
              <View className="flex-1 gap-0.5">
                <AppText weight="semibold" className="text-base">
                  {s.title}
                </AppText>
                <AppText tone={current ? "default" : "soft"} className="text-sm leading-5">
                  {s.detail}
                </AppText>
              </View>
            </Card>
          );
        })}
      </View>

      <Card tone="mint" className="gap-1.5 px-4 py-3.5">
        <AppText weight="semibold" className="text-base">
          Watch for
        </AppText>
        {activity.watchFor.map((w) => (
          <AppText key={w} className="text-sm leading-5">
            {w}
          </AppText>
        ))}
      </Card>

      <AppText weight="semibold" className="text-base">
        Need to adjust?
      </AppText>
      <View className="flex-row flex-wrap gap-2">
        {ADJUST.map((a) => (
          <Chip key={a.id} label={a.label} selected={tip === a.id} onPress={() => setTip(tip === a.id ? null : a.id)} />
        ))}
      </View>
      {tip ? (
        <Card tone="butter" className="flex-row items-start gap-3 px-4 py-3">
          <Icon name="lightbulb" size={22} color={colors.ink} />
          <AppText className="flex-1 text-base leading-6">{activity.adapt[tip]}</AppText>
        </Card>
      ) : null}

      <View className="min-h-4 flex-1" />
      <Button
        label={last ? "Finish" : "Next step"}
        onPress={() => (last ? router.replace("/teacher/home") : setStep(step + 1))}
      />
    </Screen>
  );
}