import { useLocalSearchParams, useRouter } from "expo-router";
import { View } from "react-native";

import { AppText } from "@/components/ui/AppText";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Icon } from "@/components/ui/Icon";
import { Screen } from "@/components/ui/Screen";
import { getBuddySession } from "@/data/buddy";
import { getIdea, getIdeasForChapter } from "@/data/lessons";
import { useSession } from "@/features/session/SessionContext";
import { colors } from "@/theme";

export default function SessionDoneScreen() {
  const router = useRouter();
  const { ideaId, stars } = useLocalSearchParams<{ ideaId: string; stars?: string }>();
  const { student, completedIdeaIds } = useSession();

  const idea = getIdea(ideaId);
  const earned = Number(stars ?? 0);
  const buddy = getBuddySession(student?.id);

  const nextIdea = idea
    ? getIdeasForChapter(idea.chapterId).find((i) => !completedIdeaIds.includes(i.id))
    : undefined;

  return (
    <Screen scroll>
      <Card tone="mint" className="mt-2 items-center gap-2 rounded-hero py-7">
        <View className="flex-row items-end gap-2">
          <Icon name="star" size={52} color={colors.gold} />
          <Icon name="star" size={72} color={colors.gold} />
          <Icon name="star" size={52} color={colors.gold} />
        </View>
        <AppText weight="semibold" className="text-center text-[30px] leading-10">
          You kept going!
        </AppText>
        <AppText className="text-lg">
          You earned {earned} {earned === 1 ? "star" : "stars"} today.
        </AppText>
      </Card>

      {idea ? (
        <>
          <Card className="gap-2">
            <AppText weight="medium" className="text-sm">
              You finished
            </AppText>
            <AppText weight="semibold" className="text-[22px] leading-7">
              {idea.title}
            </AppText>
          </Card>

          <Card tone="lavender" className="flex-row items-center gap-4">
            <View className="h-16 w-16 items-center justify-center rounded-full bg-ink">
              <Icon name="trophy" size={32} color={colors.surface} />
            </View>
            <View className="flex-1">
              <AppText weight="medium" className="text-sm">
                Your teacher can ask you to explain
              </AppText>
              <AppText weight="semibold" className="text-[22px]">
                {idea.title}
              </AppText>
            </View>
          </Card>
        </>
      ) : null}

      <View className="min-h-4 flex-1" />

      {nextIdea ? (
        <Button
          label="Next idea"
          onPress={() => router.replace({ pathname: "/student/learn/[ideaId]", params: { ideaId: nextIdea.id } })}
        />
      ) : null}
      {buddy ? (
        <Button
          variant={nextIdea ? "secondary" : "primary"}
          icon="users"
          label="Start a Buddy mission"
          onPress={() => router.push("/student/buddy-lobby")}
        />
      ) : null}
      <Button
        variant={nextIdea || buddy ? "secondary" : "primary"}
        label="Finish for today"
        onPress={() => router.replace("/student/home")}
      />
    </Screen>
  );
}