import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, View } from "react-native";

import { AppText } from "@/components/ui/AppText";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Header } from "@/components/ui/Header";
import { Icon } from "@/components/ui/Icon";
import { IconButton } from "@/components/ui/IconButton";
import { Screen } from "@/components/ui/Screen";
import { getIdea } from "@/data/lessons";
import { BreathingCircle } from "@/features/learn/BreathingCircle";
import { EXPLAIN_MODES, ExplainCard, explainText, type ExplainMode } from "@/features/learn/ExplainCard";
import { ReadAloudButton } from "@/features/learn/ReadAloudButton";
import { usePracticeQueue, type SetSummary } from "@/features/questions/usePracticeQueue";
import { useSession } from "@/features/session/SessionContext";
import { colors } from "@/theme";

/** Questions per set. */
const SET_SIZE = 4;

/**
 * Practice for one idea, in sets of 4:
 *  1. loading: the AI writes the whole set for this child (level, mistakes, last score)
 *  2. the 4 questions, one by one (hints, "explain it another way", brain break)
 *  3. results: how many were right first time, then "Practise 4 more" or "Finish for today"
 * The next set starts loading while the child looks at the results.
 */
export default function PracticeScreen() {
  const { ideaId } = useLocalSearchParams<{ ideaId: string }>();
  // A new `set` number gives a fresh PracticeSet (new hook state, new questions).
  const [setNumber, setSetNumber] = useState(1);
  if (!getIdea(ideaId)) {
    return (
      <Screen>
        <Header title="Idea not found" />
      </Screen>
    );
  }
  return <PracticeSet key={setNumber} ideaId={ideaId} onAnotherSet={() => setSetNumber((n) => n + 1)} />;
}

type Phase = "answer" | "correct" | "wrong" | "stuck" | "results";

function PracticeSet({ ideaId, onAnotherSet }: { ideaId: string; onAnotherSet: () => void }) {
  const router = useRouter();
  const { comfort, completeIdea } = useSession();
  const practice = usePracticeQueue(ideaId, { fewerWords: comfort.fewerWords, size: SET_SIZE });
  const { idea, question } = practice;

  const [selected, setSelected] = useState<string | null>(null);
  const [phase, setPhase] = useState<Phase>("answer");
  const [explainMode, setExplainMode] = useState<ExplainMode | null>(null);
  const [stars, setStars] = useState(0);
  const [stretch, setStretch] = useState(false);
  const [summary, setSummary] = useState<SetSummary | null>(null);

  if (!idea) return null;

  const goHome = () => router.replace("/student/home");

  const showQuestion = () => {
    setSelected(null);
    setExplainMode(null);
    setPhase("answer");
  };

  const onCheck = () => {
    if (!selected) return;
    const result = practice.answer(selected);
    if (!result) return;
    if (result.correct) {
      setStars((n) => n + 1);
      setPhase("correct");
    } else {
      setExplainMode(null);
      setPhase("wrong");
    }
  };

  const onNext = () => {
    if (practice.isLast) {
      setSummary(practice.finishSet()); // also starts loading the next set
      completeIdea(idea.id);
      setPhase("results");
      return;
    }
    practice.next();
    showQuestion();
  };

  const finishForToday = () =>
    router.replace({
      pathname: "/student/session-done",
      params: { ideaId: idea.id, stars: String(stars), nextLevel: String(summary?.nextLevel ?? practice.level) },
    });

  /* ---------- Top bar: close, progress through the set, stars ---------- */
  const doneCount = practice.index + (phase === "correct" || phase === "results" ? 1 : 0);
  const topBar = (
    <View className="flex-row items-center gap-3.5">
      <IconButton icon="x" label="Close and go home" onPress={goHome} />
      <View className="flex-1 gap-1.5">
        <View className="h-3.5 rounded-full bg-line">
          <View className="h-3.5 rounded-full bg-ink" style={{ width: `${(doneCount / practice.total) * 100}%` }} />
        </View>
        <AppText tone="muted" className="text-sm">
          {practice.loading ? `${practice.total} questions` : `Question ${practice.index + 1} of ${practice.total}`}
        </AppText>
      </View>
      <View className="h-11 flex-row items-center gap-1 rounded-full bg-butter px-3.5">
        <Icon name="star" size={20} color={colors.ink} />
        <AppText weight="semibold" className="text-base">
          {stars}
        </AppText>
      </View>
    </View>
  );

  const devLine = __DEV__ ? (
    <AppText tone="muted" className="text-center text-xs">
      dev · level {practice.level} · {question?.from ?? "loading"}
    </AppText>
  ) : null;

  /* ---------- 1. Loading the whole set ---------- */
  if (practice.loading) {
    return (
      <Screen>
        {topBar}
        <View className="flex-1 justify-center">
          <Card tone="butter" className="items-center gap-3 py-10">
            <Icon name="lightbulb" size={40} color={colors.ink} />
            <AppText weight="semibold" className="text-center text-xl">
              Getting your {practice.total} questions ready…
            </AppText>
            <AppText tone="soft" className="text-center text-base">
              {practice.basedOnLastTime ? "Picked for how you did last time." : "Picked just for you."}
            </AppText>
          </Card>
        </View>
        {devLine}
      </Screen>
    );
  }

  /* ---------- 3. Results ---------- */
  if (phase === "results" && summary) {
    const { firstTryRight, total } = summary;
    const nextNote =
      summary.nextLevel > summary.level
        ? "Next time: new questions, one step further."
        : summary.nextLevel < summary.level
          ? "Next time: new questions to build it up."
          : "Next time: new questions on this idea.";
    return (
      <Screen scroll>
        <Card tone="mint" className="items-center gap-3 py-7">
          <View className="flex-row items-end gap-2">
            <Icon name="star" size={36} color={colors.ink} />
            <Icon name="star" size={48} color={colors.ink} />
            <Icon name="star" size={36} color={colors.ink} />
          </View>
          <AppText weight="bold" className="text-center text-[28px] leading-9">
            {firstTryRight === total ? "All right first time!" : "You kept going!"}
          </AppText>
          <AppText className="text-center text-lg">
            {firstTryRight} of {total} right first time
          </AppText>
        </Card>

        <View className="gap-2.5">
          {summary.results.map((r, i) => (
            <Card key={i} className="flex-row items-center gap-3 px-4 py-3">
              <View
                className={`h-10 w-10 items-center justify-center rounded-full ${r.rightFirstTime ? "bg-ink" : "bg-butter"}`}
              >
                <Icon
                  name={r.rightFirstTime ? "check" : "lightbulb"}
                  size={20}
                  color={r.rightFirstTime ? colors.surface : colors.ink}
                />
              </View>
              <View className="flex-1">
                <AppText weight="semibold" className="text-base leading-5" numberOfLines={2}>
                  {r.prompt}
                </AppText>
                <AppText tone="muted" className="text-sm">
                  {r.rightFirstTime ? "Right first time" : "Got there with a hint"}
                </AppText>
              </View>
            </Card>
          ))}
        </View>

        <AppText tone="soft" className="text-center text-base">
          {nextNote}
        </AppText>
        {devLine}

        <View className="min-h-4 flex-1" />
        <View className="gap-3">
          <Button label={`Practise ${total} more`} icon="play" onPress={onAnotherSet} />
          <Button variant="secondary" label="Finish for today" onPress={finishForToday} />
        </View>
      </Screen>
    );
  }

  if (!question) return null;

  /* ---------- Brain break (after 2 wrong taps in a row) ---------- */
  if (phase === "wrong" && practice.needsBreak) {
    return (
      <Screen>
        <View className="flex-1 items-center justify-center gap-6">
          <AppText weight="semibold" tone="muted" className="text-sm tracking-widest">
            BRAIN BREAK
          </AppText>
          {stretch ? (
            <>
              <AppText weight="semibold" className="text-center text-[28px] leading-9">
                Reach up high
              </AppText>
              <AppText tone="soft" className="text-center text-base leading-6">
                Stretch your arms to the sky. Wiggle your fingers. Now touch your toes.
              </AppText>
            </>
          ) : (
            <>
              <BreathingCircle />
              <AppText weight="semibold" className="text-center text-[28px] leading-9">
                Slowly, nice and easy
              </AppText>
              <AppText tone="soft" className="text-center text-base leading-6">
                Watch the circle grow, then shrink. Breathe with it.
              </AppText>
            </>
          )}
        </View>
        <View className="gap-3">
          <Button
            label="I'm ready"
            onPress={() => {
              practice.takeBreak();
              setStretch(false);
            }}
          />
          <Button
            variant="secondary"
            label={stretch ? "Breathe instead" : "Stretch instead"}
            onPress={() => setStretch((s) => !s)}
          />
        </View>
      </Screen>
    );
  }

  /* ---------- Help: "Good try!" after a wrong answer, or "I'm stuck" ---------- */
  if (phase === "wrong" || phase === "stuck") {
    const wrong = phase === "wrong";
    return (
      <Screen scroll>
        {topBar}

        <Card tone="butter" className="flex-row items-center gap-4">
          <View className="h-14 w-14 items-center justify-center rounded-full bg-surface">
            <Icon name="lightbulb" size={28} color={colors.ink} />
          </View>
          <View className="flex-1">
            <AppText weight="bold" className="text-2xl">
              {wrong ? "Good try!" : "Let's think together."}
            </AppText>
            <AppText className="text-base">Let's look at it together.</AppText>
          </View>
        </Card>

        <Card className="items-center gap-4 py-6">
          <View className="rounded-full bg-mint px-4 py-1.5">
            <AppText weight="semibold" className="text-sm">
              Hint {practice.hintNumber} of 2
            </AppText>
          </View>
          <AppText weight="semibold" className="text-center text-[22px] leading-8">
            {practice.hint}
          </AppText>
          <ReadAloudButton
            text={practice.hint}
            autoPlay={comfort.readAloud}
            key={`${question.id}-${practice.hintNumber}`}
          />
        </Card>

        <AppText weight="semibold" className="text-base">
          Explain it another way
        </AppText>
        <View className="flex-row gap-2.5">
          {EXPLAIN_MODES.map((m) => {
            const on = explainMode === m.id;
            return (
              <Card
                key={m.id}
                tone={m.tone}
                accessibilityLabel={m.label}
                onPress={() => setExplainMode(on ? null : m.id)}
                className={`flex-1 items-center gap-1.5 px-1 py-4 ${on ? "border-[3px]" : ""}`}
              >
                <Icon name={m.icon} size={24} color={colors.ink} />
                <AppText weight="semibold" className="text-center text-[13px]">
                  {m.label}
                </AppText>
              </Card>
            );
          })}
        </View>

        {explainMode ? (
          <View className="gap-3">
            <ExplainCard mode={explainMode} explain={question.explain} />
            <View className="flex-row">
              <ReadAloudButton
                text={explainText(explainMode, question.explain)}
                autoPlay={comfort.readAloud}
                key={`${question.id}-${explainMode}`}
              />
            </View>
          </View>
        ) : null}

        <View className="min-h-4 flex-1" />
        <Button
          label={wrong ? "Try again" : "Back to the question"}
          icon={wrong ? "rotateCcw" : undefined}
          onPress={showQuestion}
        />
      </Screen>
    );
  }

  /* ---------- 2. The question ---------- */
  const locked = phase === "correct";

  return (
    <Screen scroll>
      {topBar}

      <Card tone="butter" className="items-center gap-3 px-5 py-5">
        <AppText weight="semibold" className="text-center text-[25px] leading-9">
          {question.prompt}
        </AppText>
        <ReadAloudButton text={question.prompt} autoPlay={comfort.readAloud} key={question.id} />
      </Card>

      <View className="gap-2.5">
        {question.options.map((option) => {
          const isSelected = selected === option.id;
          const isRight = locked && option.id === question.correctId;
          return (
            <Pressable
              key={option.id}
              accessibilityRole="button"
              accessibilityState={{ selected: isSelected, disabled: locked }}
              disabled={locked}
              onPress={() => setSelected(option.id)}
              className={`min-h-[76px] flex-row items-center justify-between rounded-card px-5 py-3 ${
                isRight
                  ? "border-[3px] border-ink bg-mint"
                  : isSelected
                    ? "border-[3px] border-ink bg-surface"
                    : "border-2 border-line bg-surface"
              }`}
            >
              <AppText weight="semibold" className="flex-1 text-[24px] leading-8">
                {option.text}
              </AppText>
              {isRight ? <Icon name="check" size={28} color={colors.ink} /> : null}
            </Pressable>
          );
        })}
      </View>

      {locked ? (
        <Card tone="mint" className="gap-1">
          <AppText weight="semibold" className="text-xl">
            You got it!
          </AppText>
          <AppText className="text-base">+1 star</AppText>
        </Card>
      ) : null}

      {devLine}

      <View className="min-h-4 flex-1" />

      {locked ? (
        <Button label={practice.isLast ? "See how I did" : "Next"} onPress={onNext} />
      ) : (
        <View className="flex-row gap-3">
          <Button variant="secondary" label="I'm stuck" className="flex-1 px-0" onPress={() => setPhase("stuck")} />
          <Button
            label="Check"
            className={`flex-1 px-0 ${selected ? "" : "opacity-40"}`}
            disabled={!selected}
            onPress={onCheck}
          />
        </View>
      )}
    </Screen>
  );
}