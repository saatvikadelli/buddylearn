import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, View } from "react-native";

import { AppText } from "@/components/ui/AppText";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Header } from "@/components/ui/Header";
import { Icon } from "@/components/ui/Icon";
import type { IconName } from "@/components/ui/icons";
import { Screen } from "@/components/ui/Screen";
import { getIdea } from "@/data/lessons";
import { findChapter } from "@/data/syllabus";
import { ReadAloudButton } from "@/features/learn/ReadAloudButton";
import { useLesson } from "@/features/questions/useLesson";
import { colors } from "@/theme";

type Mode = "story" | "picture" | "real";

const MODES: { id: Mode; label: string; icon: IconName }[] = [
  { id: "story", label: "Photo story", icon: "cakeSlice" },
  { id: "picture", label: "Picture", icon: "hash" },
  { id: "real", label: "Real life", icon: "mapPin" },
];

/**
 * Learn: the child understands the idea before practising.
 * The Photo story, Picture and Real life are written by the AI for this child
 * (their level and the mix-ups they have made). If the AI is slow or fails,
 * the book lesson from data/lessons.ts is shown instead.
 */
export default function LearnScreen() {
  const router = useRouter();
  const { ideaId, mode: startMode } = useLocalSearchParams<{ ideaId: string; mode?: Mode }>();
  const idea = getIdea(ideaId);
  const [mode, setMode] = useState<Mode>(startMode ?? "story");
  // The AI lesson for this child. `explain` is null while it is being written.
  const lesson = useLesson(ideaId);

  if (!idea) {
    return (
      <Screen>
        <Header title="Idea not found" />
      </Screen>
    );
  }
  const chapter = findChapter(idea.chapterId);
  const e = lesson.explain;

  const spoken = !e
    ? ""
    : mode === "story"
      ? e.story.map((p) => p.caption).join(" ")
      : mode === "picture"
        ? `${e.picture.big.replace("→", "then")}. ${e.picture.caption}`
        : `${e.real.line1} ${e.real.line2}`;

  return (
    <Screen scroll>
      <Header title={idea.title} step={chapter?.chapter.title} />

      <View className="flex-row gap-2">
        {MODES.map((m) => {
          const selected = m.id === mode;
          return (
            <Pressable
              key={m.id}
              accessibilityRole="button"
              accessibilityState={{ selected }}
              onPress={() => setMode(m.id)}
              className={`h-[68px] flex-1 items-center justify-center gap-1 rounded-full border-2 ${
                selected ? "border-ink bg-ink" : "border-line bg-surface"
              }`}
            >
              <Icon name={m.icon} size={22} color={selected ? colors.surface : colors.ink} />
              <AppText weight="medium" tone={selected ? "inverse" : "default"} className="text-[13px]">
                {m.label}
              </AppText>
            </Pressable>
          );
        })}
      </View>

      {!e ? (
        <Card tone="butter" className="items-center gap-3 py-10">
          <Icon name="lightbulb" size={40} color={colors.ink} />
          <AppText weight="semibold" className="text-center text-xl">
            Getting your lesson ready…
          </AppText>
          <AppText tone="soft" className="text-center text-base">
            Written just for you.
          </AppText>
        </Card>
      ) : null}

      {e && mode === "story" ? (
        <View className="gap-3">
          {e.story.map((panel, i) => (
            <Card key={i} className="flex-row items-center gap-4 p-3.5">
              <View className="h-[84px] w-[104px] items-center justify-center rounded-[18px] bg-butter">
                <Icon name={panel.icon} size={44} color={colors.ink} />
              </View>
              <AppText weight="semibold" className="flex-1 text-lg leading-[26px]">
                {panel.caption}
              </AppText>
            </Card>
          ))}
        </View>
      ) : null}

      {e && mode === "picture" ? (
        <Card tone="sky" className="items-center gap-3 py-8">
          <AppText weight="bold" className="text-center text-[34px] leading-[44px]">
            {e.picture.big}
          </AppText>
          <AppText weight="semibold" className="text-center text-[22px] leading-8">
            {e.picture.caption}
          </AppText>
        </Card>
      ) : null}

      {e && mode === "real" ? (
        <Card tone="peach" className="items-center gap-3 py-6">
          <Icon name={e.real.icon} size={56} color={colors.ink} />
          <AppText weight="semibold" className="text-center text-[22px] leading-8">
            {e.real.line1}
          </AppText>
          <AppText className="text-center text-xl leading-8">{e.real.line2}</AppText>
        </Card>
      ) : null}

      {e ? (
        <View className="flex-row">
          <ReadAloudButton text={spoken} key={`${mode}-${lesson.from}`} />
        </View>
      ) : null}

      {__DEV__ ? (
        <AppText tone="muted" className="text-center text-xs">
          dev · lesson from {lesson.ready ? lesson.from : "…"}
        </AppText>
      ) : null}

      <View className="min-h-4 flex-1" />
      <Button
        label="Got it, let's practise"
        onPress={() => router.push({ pathname: "/student/practice/[ideaId]", params: { ideaId: idea.id } })}
      />
    </Screen>
  );
}