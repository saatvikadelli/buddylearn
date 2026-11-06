import { useRouter } from "expo-router";
import { View } from "react-native";

import { AppText } from "@/components/ui/AppText";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Header } from "@/components/ui/Header";
import { Icon } from "@/components/ui/Icon";
import { Screen } from "@/components/ui/Screen";
import { getBuddySession } from "@/data/buddy";
import { useSession } from "@/features/session/SessionContext";
import { colors } from "@/theme";

const STEPS = [
  "Sit side by side with one phone.",
  "One of you sees the picture. The other sees the letters.",
  "Agree on the answer, then swap roles.",
];

export default function BuddyLobbyScreen() {
  const router = useRouter();
  const { student, schoolClass } = useSession();
  const session = getBuddySession(student?.id);

  if (!student || !session) {
    return (
      <Screen>
        <Header title="Buddy mission" />
        <Card tone="blush" className="gap-2">
          <AppText weight="semibold" className="text-xl">
            No buddy mission planned yet
          </AppText>
          <AppText className="text-base leading-6">Ask your teacher to plan one from the Home page.</AppText>
        </Card>
        <View className="flex-1" />
        <Button label="Back to home" onPress={() => router.replace("/student/home")} />
      </Screen>
    );
  }

  const buddy = schoolClass?.students.find((s) => s.name === session.buddyName);

  return (
    <Screen scroll>
      <Header title="Meet your buddy" step="Buddy mission" />

      <Card tone="blush" className="items-center gap-3 rounded-hero py-6">
        <View className="flex-row">
          <View className="rounded-full border-4 border-surface">
            <Avatar name={student.name} tone={student.tone} size={84} />
          </View>
          <View className="-ml-4 rounded-full border-4 border-surface">
            <Avatar name={session.buddyName} tone={buddy?.tone ?? "mint"} size={84} />
          </View>
        </View>
        <AppText weight="semibold" className="text-center text-[26px] leading-8">
          You and {session.buddyName} are a team
        </AppText>
        <AppText className="text-center text-base">
          {session.title} · {session.when}
        </AppText>
      </Card>

      <Card className="gap-3.5">
        <AppText weight="semibold" className="text-base">
          How it works
        </AppText>
        {STEPS.map((step, i) => (
          <View key={step} className="flex-row items-start gap-3">
            <View className="h-[34px] w-[34px] items-center justify-center rounded-full bg-ink">
              <AppText weight="semibold" tone="inverse" className="text-base">
                {i + 1}
              </AppText>
            </View>
            <AppText className="flex-1 text-base leading-6">{step}</AppText>
          </View>
        ))}
      </Card>

      <Card tone="mint" className="flex-row items-center gap-3 px-4 py-3">
        <Icon name="timer" size={26} color={colors.ink} />
        <AppText className="flex-1 text-sm leading-5">
          About 5 minutes. No timer, no winner. You grow the garden together.
        </AppText>
      </Card>

      <View className="min-h-4 flex-1" />
      <Button label="We're ready" onPress={() => router.push("/student/buddy-mission")} />
    </Screen>
  );
}