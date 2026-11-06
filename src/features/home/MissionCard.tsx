import { View } from "react-native";
import { SvgXml } from "react-native-svg";

import { AppText } from "@/components/ui/AppText";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import type { Book, Chapter } from "@/data/syllabus";
import { colors } from "@/theme";

const art = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 130 130">
  <circle cx="70" cy="62" r="52" fill="${colors.blush}"/>
  <circle cx="62" cy="66" r="38" fill="${colors.surface}" stroke="${colors.ink}" stroke-width="3"/>
  <path d="M62 28 A38 38 0 0 1 62 104 Z" fill="${colors.gold}" stroke="${colors.ink}" stroke-width="3"/>
  <circle cx="62" cy="66" r="38" fill="none" stroke="${colors.ink}" stroke-width="3"/>
</svg>`;

type Props = {
  book: Book;
  chapter: Chapter;
  isNew: boolean;
  onStart: () => void;
};

export function MissionCard({ book, chapter, isNew, onStart }: Props) {
  return (
    <Card tone="mint" className="gap-2.5 overflow-hidden rounded-hero px-5 pb-5 pt-[22px]">
      <View className="absolute -right-5 top-2" pointerEvents="none" aria-hidden>
        <SvgXml xml={art} width={150} height={150} />
      </View>

      <AppText weight="medium" className="text-sm">
        {isNew ? "Your first mission" : "Today's mission"}
      </AppText>
      <AppText weight="semibold" className="max-w-[200px] text-[28px] leading-9">
        {chapter.title}
      </AppText>
      <AppText className="mb-1.5 text-sm">
        {book.title} · Chapter {chapter.number}
      </AppText>

      <View className="mb-1 flex-row">
        <View className="rounded-full bg-surface px-3 py-1.5">
          <AppText weight="medium" className="text-sm">
            {isNew ? "Not started yet" : "In progress"}
          </AppText>
        </View>
      </View>

      <Button large icon="play" label={isNew ? "Start" : "Continue"} onPress={onStart} />
    </Card>
  );
}