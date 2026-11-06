import * as Speech from "expo-speech";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Pressable, View } from "react-native";
import Svg, { Circle, Path } from "react-native-svg";

import { AppText } from "@/components/ui/AppText";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Chip } from "@/components/ui/Chip";
import { Header } from "@/components/ui/Header";
import { Icon } from "@/components/ui/Icon";
import { IconButton } from "@/components/ui/IconButton";
import { Screen } from "@/components/ui/Screen";
import { getIdeasForChapter, type Idea } from "@/data/lessons";
import { findChapter } from "@/data/syllabus";
import { usePrefetchLesson } from "@/features/questions/useLesson";
import { useSession } from "@/features/session/SessionContext";
import { colors } from "@/theme";

type Mode = "story" | "picture" | "real";

/** "Expert" on the chapter page once the child reaches this practice level on an idea. */
const EXPERT_LEVEL = 3;

/**
 * Chapter page: progress, then the ideas as a timeline.
 *  ✓ done ideas · ▶ today's idea (open, with "Learn it your way") · numbered next ideas.
 * The same layout is used for every chapter of every book. Ideas come from data/lessons.ts;
 * chapters without ideas there show "Lessons are coming soon".
 */
export default function ChapterScreen() {
  const router = useRouter();
  const { chapterId } = useLocalSearchParams<{ chapterId: string }>();
  const { completedIdeaIds, ideaLevels } = useSession();
  const [speaking, setSpeaking] = useState(false);

  const found = findChapter(chapterId);
  const ideas = found ? getIdeasForChapter(found.chapter.id) : [];
  const current = ideas.find((i) => !completedIdeaIds.includes(i.id)) ?? ideas[0];

  // Start writing today's AI lesson now, so it is ready when the child taps in.
  usePrefetchLesson(current?.id);

  // Stop reading aloud when the child leaves the page.
  useEffect(() => () => Speech.stop(), []);

  if (!found) {
    return (
      <Screen>
        <Header title="Chapter not found" />
      </Screen>
    );
  }
  const { book, chapter } = found;
  const subtitle = `${book.title} · Chapter ${chapter.number}`;

  const topBar = (
    <View className="flex-row items-center gap-3">
      <IconButton
        icon="arrowLeft"
        label="Back"
        onPress={() => (router.canGoBack() ? router.back() : router.replace("/student/books"))}
      />
      <View className="flex-1">
        <AppText tone="muted" className="text-sm">
          {subtitle}
        </AppText>
        <AppText weight="semibold" className="text-xl" numberOfLines={2}>
          {chapter.title}
        </AppText>
      </View>
      {ideas.length > 0 ? (
        <IconButton
          icon="volume2"
          label={speaking ? "Stop reading" : "Read this page to me"}
          onPress={() => {
            if (speaking) {
              Speech.stop();
              setSpeaking(false);
              return;
            }
            const doneCount = ideas.filter((i) => completedIdeaIds.includes(i.id)).length;
            setSpeaking(true);
            Speech.speak(
              `${chapter.title}. ${doneCount} of ${ideas.length} ideas done. Ideas in this chapter: ${ideas
                .map((i) => i.title)
                .join(". ")}.`,
              { rate: 0.9, onDone: () => setSpeaking(false) },
            );
          }}
        />
      ) : null}
    </View>
  );

  if (ideas.length === 0 || !current) {
    return (
      <Screen>
        {topBar}
        <Card tone={book.tone} className="gap-2">
          <AppText weight="semibold" className="text-xl">
            Lessons are coming soon
          </AppText>
          <AppText className="text-base leading-6">
            We are still getting this chapter ready. You can try a sample lesson now.
          </AppText>
        </Card>
        <View className="flex-1" />
        <Button label="Try a sample lesson" onPress={() => router.replace("/student/chapter/maths-2")} />
      </Screen>
    );
  }

  const done = ideas.filter((i) => completedIdeaIds.includes(i.id)).length;
  const openLearn = (ideaId: string, mode?: Mode) =>
    router.push({ pathname: "/student/learn/[ideaId]", params: { ideaId, ...(mode ? { mode } : {}) } });

  return (
    <Screen scroll>
      {topBar}

      {/* Your progress */}
      <Card tone="blush" className="flex-row items-center gap-3 overflow-hidden rounded-hero px-5 py-4">
        <View className="flex-1 gap-2">
          <AppText weight="medium" className="text-sm">
            Your progress
          </AppText>
          <AppText weight="bold" className="text-[26px] leading-8">
            {done} of {ideas.length} ideas done
          </AppText>
          <View className="h-3 w-4/5 rounded-full bg-surface">
            <View className="h-3 rounded-full bg-ink" style={{ width: `${(done / ideas.length) * 100}%` }} />
          </View>
        </View>
        <View className="h-[88px] w-[88px] items-center justify-center rounded-full bg-butter">
          <ProgressPie done={done} total={ideas.length} />
        </View>
      </Card>

      <AppText weight="semibold" className="text-[22px]">
        Ideas in this chapter
      </AppText>

      {/* Timeline */}
      <View>
        {ideas.map((idea, index) => (
          <TimelineRow
            key={idea.id}
            idea={idea}
            number={index + 1}
            last={index === ideas.length - 1}
            state={completedIdeaIds.includes(idea.id) ? "done" : idea.id === current.id ? "current" : "next"}
            expert={(ideaLevels[idea.id] ?? 1) >= EXPERT_LEVEL}
            onOpen={openLearn}
          />
        ))}
      </View>

      <View className="min-h-4 flex-1" />
      <Button
        icon="play"
        label="Start practice"
        onPress={() => router.push({ pathname: "/student/practice/[ideaId]", params: { ideaId: current.id } })}
      />
    </Screen>
  );
}

type RowState = "done" | "current" | "next";

function TimelineRow({
  idea,
  number,
  last,
  state,
  expert,
  onOpen,
}: {
  idea: Idea;
  number: number;
  last: boolean;
  state: RowState;
  expert: boolean;
  onOpen: (ideaId: string, mode?: Mode) => void;
}) {
  const circle =
    state === "done" ? (
      <View className="h-11 w-11 items-center justify-center rounded-full bg-ink">
        <Icon name="check" size={22} color={colors.surface} />
      </View>
    ) : state === "current" ? (
      <View className="h-11 w-11 items-center justify-center rounded-full border-[3px] border-ink bg-butter">
        <Icon name="play" size={18} color={colors.ink} />
      </View>
    ) : (
      <View className="h-11 w-11 items-center justify-center rounded-full bg-track">
        <AppText weight="semibold" className="text-base">
          {number}
        </AppText>
      </View>
    );

  return (
    <View className="flex-row gap-3">
      {/* Left: circle and the line down to the next idea */}
      <View className="w-11 items-center">
        {circle}
        {last ? null : <View className="w-[3px] flex-1 bg-track" />}
      </View>

      {/* Right: the idea */}
      <View className={`flex-1 ${last ? "" : "pb-4"}`}>
        {state === "current" ? (
          <View className="gap-2 rounded-card border-[3px] border-ink bg-surface px-4 py-3.5">
            <View>
              <AppText weight="semibold" className="text-lg leading-6">
                {idea.title}
              </AppText>
              <AppText tone="muted" className="text-sm">
                Today's idea · {idea.minutes} minutes
              </AppText>
            </View>
            <AppText weight="medium" className="text-sm">
              Learn it your way
            </AppText>
            <View className="flex-row flex-wrap gap-2">
              <Chip label="Photo story" selected onPress={() => onOpen(idea.id, "story")} />
              <Chip label="Picture" onPress={() => onOpen(idea.id, "picture")} />
              <Chip label="Real life" onPress={() => onOpen(idea.id, "real")} />
            </View>
          </View>
        ) : (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`${idea.title}. ${state === "done" ? "Done. Open to learn again." : "Next. Open to start."}`}
            onPress={() => onOpen(idea.id)}
            className="min-h-11 justify-center active:opacity-70"
          >
            <AppText weight="semibold" className="text-lg leading-6">
              {idea.title}
            </AppText>
            <AppText tone="muted" className="text-sm">
              {state === "done" ? (expert ? "Done · You are the expert" : "Done") : "Next"}
            </AppText>
          </Pressable>
        )}
      </View>
    </View>
  );
}

/**
 * The circle on the progress card: the shaded part is how much of the chapter is done
 * (2 of 5 ideas → 2/5 shaded), with a line at each edge like a cut roti.
 */
function ProgressPie({ done, total, size = 64 }: { done: number; total: number; size?: number }) {
  const stroke = 3;
  const r = (size - stroke) / 2;
  const c = size / 2;
  const fraction = total > 0 ? Math.min(1, Math.max(0, done / total)) : 0;
  const angle = fraction * 2 * Math.PI;
  // Start at the top (12 o'clock) and go clockwise.
  const x = c + r * Math.sin(angle);
  const y = c - r * Math.cos(angle);
  const wedge = `M ${c} ${c} L ${c} ${c - r} A ${r} ${r} 0 ${fraction > 0.5 ? 1 : 0} 1 ${x} ${y} Z`;

  return (
    <Svg width={size} height={size}>
      <Circle cx={c} cy={c} r={r} fill={colors.surface} />
      {fraction >= 1 ? (
        <Circle cx={c} cy={c} r={r} fill={colors.mint} />
      ) : fraction > 0 ? (
        <Path d={wedge} fill={colors.mint} stroke={colors.ink} strokeWidth={stroke} strokeLinejoin="round" />
      ) : null}
      <Circle cx={c} cy={c} r={r} fill="none" stroke={colors.ink} strokeWidth={stroke} />
    </Svg>
  );
}