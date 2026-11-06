import { useRouter } from "expo-router";
import { View } from "react-native";

import { AppText } from "@/components/ui/AppText";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Header } from "@/components/ui/Header";
import { Icon } from "@/components/ui/Icon";
import { Screen } from "@/components/ui/Screen";
import { GARDEN_BASE, GARDEN_GOAL, getBadges } from "@/data/badge";
import { useSession } from "@/features/session/SessionContext";
import { colors } from "@/theme";

export default function StarsScreen() {
  const router = useRouter();
  const { student, stars, buddyMissionsDone, completedIdeaIds, completedChapterIds } = useSession();

  const badges = getBadges({ stars, buddyMissionsDone, completedIdeaIds, completedChapterIds });
  const earnedCount = badges.filter((b) => b.earned).length;

  // Everything the class has done together, including this child.
  const garden = Math.min(GARDEN_GOAL, GARDEN_BASE + completedIdeaIds.length + buddyMissionsDone);

  return (
    <Screen scroll>
      <Header title="My stars" step={student?.name} />

      <Card tone="butter" className="items-center gap-1 rounded-hero py-7">
        <Icon name="star" size={88} color={colors.ink} fill={colors.gold} />
        <AppText weight="bold" className="text-[48px] leading-[56px]">
          {stars}
        </AppText>
        <AppText className="text-lg">{stars === 1 ? "star so far" : "stars so far"}</AppText>
      </Card>

      <View className="flex-row items-center justify-between">
        <AppText weight="semibold" className="text-xl">
          My badges
        </AppText>
        <AppText tone="muted" className="text-sm">
          {earnedCount} earned
        </AppText>
      </View>

      <View className="-mx-1 flex-row flex-wrap">
        {badges.map((badge) => (
          <View key={badge.id} className="w-1/2 p-1">
            {badge.earned ? (
              <Card
                tone={badge.tone}
                accessibilityLabel={`${badge.title}. ${badge.hint}`}
                className="min-h-[132px] items-center gap-2 px-3 py-4"
              >
                <View className="h-12 w-12 items-center justify-center rounded-full bg-ink">
                  <Icon name={badge.icon} size={26} color={colors.surface} />
                </View>
                <AppText weight="semibold" className="text-center text-[15px] leading-5">
                  {badge.title}
                </AppText>
                <AppText className="text-center text-xs leading-4">{badge.hint}</AppText>
              </Card>
            ) : (
              <View
                accessible
                accessibilityLabel={`Not earned yet. ${badge.title}. ${badge.hint}`}
                className="min-h-[132px] items-center gap-2 rounded-card border-2 border-dashed border-line-strong bg-surface px-3 py-4"
              >
                <View className="h-12 w-12 items-center justify-center rounded-full bg-track">
                  <Icon name={badge.icon} size={26} color={colors.inkMuted} />
                </View>
                <AppText weight="semibold" tone="muted" className="text-center text-[15px] leading-5">
                  {badge.title}
                </AppText>
                <AppText tone="muted" className="text-center text-xs leading-4">
                  {badge.hint}
                </AppText>
              </View>
            )}
          </View>
        ))}
      </View>

      <Card tone="mint" className="gap-2.5">
        <View className="flex-row items-center gap-3.5">
          <Icon name="sprout" size={40} color={colors.ink} />
          <View className="flex-1">
            <AppText weight="semibold" className="text-[17px]">
              Our class garden
            </AppText>
            <AppText className="text-sm">
              {garden} of {GARDEN_GOAL} missions done together
            </AppText>
          </View>
        </View>
        <View className="h-3 rounded-full bg-surface">
          <View className="h-3 rounded-full bg-ink" style={{ width: `${(garden / GARDEN_GOAL) * 100}%` }} />
        </View>
      </Card>

      <View className="min-h-4 flex-1" />
      <Button label="Back to learning" onPress={() => router.replace("/student/home")} />
    </Screen>
  );
}