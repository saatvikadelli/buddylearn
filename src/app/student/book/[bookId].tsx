import { useLocalSearchParams, useRouter } from "expo-router";
import { View } from "react-native";

import { AppText } from "@/components/ui/AppText";
import { Card } from "@/components/ui/Card";
import { Header } from "@/components/ui/Header";
import { Screen } from "@/components/ui/Screen";
import { CLASS_LABEL, getBook, getNextMission } from "@/data/syllabus";
import { useSession } from "@/features/session/SessionContext";

export default function BookScreen() {
  const router = useRouter();
  const { bookId } = useLocalSearchParams<{ bookId: string }>();
  const { completedChapterIds } = useSession();
  const book = getBook(bookId);

  if (!book) {
    return (
      <Screen>
        <Header title="Book not found" />
      </Screen>
    );
  }

  const next = getNextMission(completedChapterIds);

  return (
    <Screen scroll>
      <Header title={book.title} step={`${CLASS_LABEL} · ${book.subject}`} />
      <AppText tone="soft" className="text-base">
        {book.chapters.length} chapters
      </AppText>

      <View className="gap-2.5">
        {book.chapters.map((chapter, index) => {
          const isStart = next?.chapter.id === chapter.id;
          const showUnit = chapter.unit && chapter.unit !== book.chapters[index - 1]?.unit;
          return (
            <View key={chapter.id} className="gap-2.5">
              {showUnit ? (
                <AppText weight="semibold" tone="muted" className="mt-2 text-sm">
                  {chapter.unit}
                </AppText>
              ) : null}
              
                <Card
     tone={isStart ? "blush" : "white"}
     accessibilityLabel={`Chapter ${chapter.number}, ${chapter.title}`}
     onPress={() =>
       router.push({ pathname: "/student/chapter/[chapterId]", params: { chapterId: chapter.id } })
     }
     className="flex-row items-center gap-3 px-3.5 py-3"
   >
                <View className="h-10 w-10 items-center justify-center rounded-full bg-surface">
                  <AppText weight="semibold" className="text-base">
                    {chapter.number}
                  </AppText>
                </View>
                <View className="flex-1">
                  <AppText weight="semibold" className="text-base leading-5">
                    {chapter.title}
                  </AppText>
                  {chapter.kind ? (
                    <AppText tone="muted" className="text-sm capitalize">
                      {chapter.kind}
                    </AppText>
                  ) : null}
                </View>
                {isStart ? (
                  <View className="rounded-full bg-ink px-3 py-1.5">
                    <AppText tone="inverse" weight="semibold" className="text-sm">
                      Start here
                    </AppText>
                  </View>
                ) : null}
              </Card>
            </View>
          );
        })}
      </View>
    </Screen>
  );
}