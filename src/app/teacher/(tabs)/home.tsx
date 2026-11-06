import { useRouter } from "expo-router";
import { useMemo } from "react";
import { Pressable, View } from "react-native";

import { AppText } from "@/components/ui/AppText";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { Card, type CardTone } from "@/components/ui/Card";
import { IconButton } from "@/components/ui/IconButton";
import { Screen } from "@/components/ui/Screen";
import { getClassInsights, summarise, type Status } from "@/data/analytics";
import { getIdea } from "@/data/lessons";
import { findChapter } from "@/data/syllabus";
import { ClassSwitcher } from "@/features/dashboard/ClassSwitcher";
import { useTeacher } from "@/features/teacher/TeacherContext";

const greeting = () => {
  const hour = new Date().getHours();
  return hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
};

/** "1 needs" / "5 need". */
const verb = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;

/**
 * Teacher Home: today's suggestion, the three class counts and chapter progress.
 * Numbers are DEMO data from data/analytics.ts (later: from what children do in the app).
 */
export default function TeacherHomeScreen() {
  const router = useRouter();
  const { teacher, activeClass, signOut } = useTeacher();

  const insights = useMemo(() => (activeClass ? getClassInsights(activeClass) : []), [activeClass]);
  const summary = useMemo(() => summarise(insights), [insights]);

  if (!teacher) {
    return (
      <Screen>
        <AppText weight="semibold" className="text-2xl">
          Please sign in
        </AppText>
        <View className="flex-1" />
        <Button label="Sign in" onPress={() => router.replace("/teacher/login")} />
      </Screen>
    );
  }

  const openClass = (filter?: Status) =>
    router.push(filter ? { pathname: "/teacher/class", params: { filter } } : "/teacher/class");

  // The chapter that today's suggested idea belongs to, e.g. "Ch 2 · Fractions".
  const idea = getIdea(summary.suggestion.ideaId);
  const chapter = idea ? findChapter(idea.chapterId)?.chapter : null;

  const total = activeClass?.students.length ?? 0;
  const joined = total - (activeClass?.notJoinedIds?.length ?? 0);

  const counts: { value: number; label: string; tone: CardTone; filter?: Status }[] = [
    { value: summary.practised, label: "practised", tone: "mint" },
    { value: summary.nudge, label: "need a nudge", tone: "butter", filter: "nudge" },
    { value: summary.ready, label: "ready to help", tone: "lavender", filter: "ready" },
  ];

  return (
    <Screen scroll tabBar>
      {/* Greeting + class button */}
      <View className="flex-row items-center gap-3">
        <Avatar name={teacher.name} tone="sky" size={52} />
        <View className="flex-1">
          <AppText tone="muted" className="text-sm">
            {greeting()}
          </AppText>
          <AppText weight="semibold" className="text-[22px]">
            {teacher.name}
          </AppText>
        </View>
        {activeClass ? <IconButton icon="users" label="Open my class" onPress={() => openClass()} /> : null}
      </View>

      <ClassSwitcher />

      {!activeClass ? (
        <>
          <Card tone="blush" className="gap-2">
            <AppText weight="semibold" className="text-xl">
              Set up your first class
            </AppText>
            <AppText className="text-base leading-6">
              Add your students and books. It takes about two minutes.
            </AppText>
          </Card>
          <Button label="Set up a class" onPress={() => router.push("/teacher/setup")} />
        </>
      ) : (
        <>
          <AppText tone="soft" className="text-sm">
            {activeClass.name} · {joined} of {total} children have joined
          </AppText>

          {/* Today's suggestion */}
          <Card tone="blush" className="gap-2 rounded-hero px-5 py-5">
            <AppText weight="semibold" className="text-sm">
              Today's suggestion
            </AppText>
            <AppText weight="semibold" className="text-[28px] leading-9">
              {summary.suggestion.idea}
            </AppText>
            <AppText className="text-base leading-6">
              {verb(summary.suggestion.practising, "is", "are")} practising.{" "}
              {verb(summary.suggestion.needHelp, "needs", "need")} help. A group activity will help most.
            </AppText>
            <Button
              label="Get a group activity"
              className="mt-1.5"
              onPress={() =>
                router.push({ pathname: "/teacher/activities", params: { topicId: summary.suggestion.ideaId } })
              }
            />
          </Card>

          {/* The three counts: each opens the Class list with that filter */}
          <View className="flex-row gap-2.5">
            {counts.map((c) => (
              <Card
                key={c.label}
                tone={c.tone}
                accessibilityLabel={`${c.value} ${c.label}. Open the class list.`}
                onPress={() => openClass(c.filter)}
                className="flex-1 gap-0.5 p-3.5"
              >
                <AppText weight="bold" className="text-[30px]">
                  {c.value}
                </AppText>
                <AppText className="text-sm leading-5">{c.label}</AppText>
              </Card>
            ))}
          </View>

          {/* Chapter progress */}
          <Card className="gap-2.5 px-4 py-3.5">
            <View className="flex-row items-center justify-between gap-2">
              <AppText weight="semibold" className="flex-1 text-base" numberOfLines={1}>
                {chapter ? `Ch ${chapter.number} · ${chapter.title}` : summary.suggestion.idea}
              </AppText>
              <AppText weight="semibold" className="text-sm">
                {summary.chapterAverage}% of the class
              </AppText>
            </View>
            <View className="h-3 rounded-full bg-line">
              <View className="h-3 rounded-full bg-ink" style={{ width: `${summary.chapterAverage}%` }} />
            </View>
          </Card>
        </>
      )}

      <View className="min-h-4 flex-1" />
      <Pressable
        accessibilityRole="link"
        onPress={() => {
          signOut();
          router.dismissAll();
          router.replace("/");
        }}
        className="items-center py-2"
      >
        <AppText weight="semibold" tone="muted" className="text-sm underline">
          Sign out
        </AppText>
      </Pressable>
    </Screen>
  );
}