import { View } from "react-native";

import { AppText } from "@/components/ui/AppText";
import { Card } from "@/components/ui/Card";
import { Icon } from "@/components/ui/Icon";
import type { Book } from "@/data/syllabus";
import { colors } from "@/theme";

const GLYPH: Record<string, string> = { maths: "+", english: "Aa", hindi: "अ" };

type Props = { book: Book; onPress: () => void; className?: string };

export function BookCard({ book, onPress, className = "" }: Props) {
  const count = book.chapters.length;
  return (
    <Card
      tone={book.tone}
      onPress={onPress}
      accessibilityLabel={`${book.subject}, ${book.title}, ${count} chapters`}
      className={`min-h-[158px] gap-1 ${className}`}
    >
      <View className="mb-2 h-12 w-12 items-center justify-center rounded-full bg-surface">
        {book.id === "evs" ? (
          <Icon name="sprout" size={26} color={colors.ink} />
        ) : (
          <AppText weight="semibold" className="text-xl">
            {GLYPH[book.id]}
          </AppText>
        )}
      </View>
      <AppText weight="semibold" className="text-xl">
        {book.subject}
      </AppText>
      <AppText className="text-sm">{book.titleNative ?? book.title}</AppText>
      <AppText weight="semibold" className="text-sm">
        {count} chapters
      </AppText>
    </Card>
  );
}