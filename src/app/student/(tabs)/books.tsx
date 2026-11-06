import { useRouter } from "expo-router";
import { useState } from "react";
import { TextInput, View } from "react-native";

import { AppText } from "@/components/ui/AppText";
import { Card } from "@/components/ui/Card";
import { Header } from "@/components/ui/Header";
import { Icon } from "@/components/ui/Icon";
import { Screen } from "@/components/ui/Screen";
import { CLASS_LABEL, SYLLABUS, TOTAL_CHAPTERS, getNextMission } from "@/data/syllabus";
import { BookCard } from "@/features/home/BookCard";
import { useSession } from "@/features/session/SessionContext";
import { colors } from "@/theme";

export default function BooksScreen() {
  const router = useRouter();
  const { completedChapterIds } = useSession();
  const [query, setQuery] = useState("");

  const openBook = (bookId: string) =>
    router.push({ pathname: "/student/book/[bookId]", params: { bookId } });

  const q = query.trim().toLowerCase();
  const results =
    q.length >= 2
      ? SYLLABUS.flatMap((book) =>
          book.chapters
            .filter((c) => c.title.toLowerCase().includes(q))
            .map((chapter) => ({ book, chapter })),
        ).slice(0, 8)
      : [];

  const mission = getNextMission(completedChapterIds);

  return (
    <Screen scroll tabBar>
      <Header title="My books" step={`${CLASS_LABEL} · ${TOTAL_CHAPTERS} chapters`} hideBack />

      <View className="h-14 flex-row items-center gap-2.5 rounded-full border-2 border-line bg-surface px-[18px]">
        <Icon name="search" size={22} color={colors.inkMuted} />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Find a chapter"
          placeholderTextColor={colors.inkMuted}
          accessibilityLabel="Find a chapter"
          autoCorrect={false}
          className="flex-1 font-lexend text-base text-ink"
        />
      </View>

      {q.length >= 2 ? (
        results.length > 0 ? (
          <View className="gap-2.5">
            {results.map(({ book, chapter }) => (
              <Card
                key={chapter.id}
                onPress={() => openBook(book.id)}
                accessibilityLabel={`${chapter.title}, ${book.subject}`}
                className="px-4 py-3"
              >
                <AppText weight="semibold" className="text-base">
                  {chapter.title}
                </AppText>
                <AppText tone="muted" className="text-sm">
                  {book.subject} · Chapter {chapter.number}
                </AppText>
              </Card>
            ))}
          </View>
        ) : (
          <AppText tone="soft" className="text-base">
            No chapter found. Try another word.
          </AppText>
        )
      ) : (
        <>
          <View className="-mx-1.5 flex-row flex-wrap">
            {SYLLABUS.map((book) => (
              <View key={book.id} className="w-1/2 px-1.5 pb-3">
                <BookCard book={book} onPress={() => openBook(book.id)} />
              </View>
            ))}
          </View>

          {mission ? (
            <Card
              onPress={() => openBook(mission.book.id)}
              accessibilityLabel={`Start with ${mission.chapter.title}`}
              className="flex-row items-center gap-3.5 border-ink bg-ink"
            >
              <View className="h-12 w-12 items-center justify-center rounded-full bg-mint">
                <Icon name="play" size={22} color={colors.ink} />
              </View>
              <View className="flex-1">
                <AppText tone="inverse" className="text-sm">
                  {completedChapterIds.length === 0 ? "Start here" : "Pick up where you stopped"}
                </AppText>
                <AppText tone="inverse" weight="semibold" className="text-[17px]">
                  {mission.book.subject} · {mission.chapter.title}
                </AppText>
              </View>
            </Card>
          ) : null}
        </>
      )}
    </Screen>
  );
}