import { useRouter } from "expo-router";
import { Pressable, ScrollView, View } from "react-native";

import { AppText } from "@/components/ui/AppText";
import { Avatar } from "@/components/ui/Avatar";
import { Icon } from "@/components/ui/Icon";
import { Screen } from "@/components/ui/Screen";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { getBuddySession } from "@/data/buddy";
import { SYLLABUS, getNextMission } from "@/data/syllabus";
import { BookCard } from "@/features/home/BookCard";
import { BuddyCard } from "@/features/home/BuddyCard";
import { MissionCard } from "@/features/home/MissionCard";
import { useSession } from "@/features/session/SessionContext";
import { colors } from "@/theme";

const greeting = () => {
  const hour = new Date().getHours();
  return hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
};

export default function HomeScreen() {
  const router = useRouter();
  const { student, stars,completedChapterIds, buddyRequested, requestBuddySession } = useSession();

  const mission = getNextMission(completedChapterIds);
  const buddy = getBuddySession(student?.id);
  const name = student?.name ?? "friend";

  return (
    <Screen scroll tabBar>
      <View className="flex-row items-center gap-3">
        <Avatar name={name} tone={student?.tone ?? "butter"} size={56} />
        <View className="flex-1">
          <AppText tone="muted" className="text-sm">
            {greeting()}
          </AppText>
          <AppText weight="semibold" className="text-2xl">
            Hi {name}
          </AppText>
        </View>
        <Pressable
  accessibilityRole="button"
  accessibilityLabel={`My stars, ${stars}`}
  onPress={() => router.push("/student/stars")}
  className="h-12 flex-row items-center gap-1.5 rounded-full border-2 border-line bg-surface px-3.5 active:opacity-80"
>
  <Icon name="star" size={20} color={colors.ink} fill={colors.gold} />
  <AppText weight="semibold" className="text-base">
    {stars}
  </AppText>
</Pressable>
      </View>

      {mission ? (
        <MissionCard
          book={mission.book}
          chapter={mission.chapter}
          isNew={completedChapterIds.length === 0}
          // TODO: open the chapter's lesson screen once it is built
             onStart={() =>
     router.push({ pathname: "/student/chapter/[chapterId]", params: { chapterId: mission.chapter.id } })
   }
        />
      ) : null}

      <SectionTitle title="My books" actionLabel="See all" onAction={() => router.push("/student/books")} />
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="-mx-5 flex-grow-0"
        contentContainerClassName="gap-3 px-5"
      >
        {SYLLABUS.map((book) => (
          <BookCard
            key={book.id}
            book={book}
            className="w-[160px]"
            onPress={() =>
              router.push({ pathname: "/student/book/[bookId]", params: { bookId: book.id } })
            }
          />
        ))}
      </ScrollView>

      <SectionTitle title="Buddy mission" />
      <BuddyCard
        session={buddy}
        requested={buddyRequested}
        onAsk={requestBuddySession}
        onOpen={() => router.push("/student/buddy-lobby")}
      />
    </Screen>
  );
}