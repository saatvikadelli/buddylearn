import { View } from "react-native";

import { AppText } from "@/components/ui/AppText";
import { Card } from "@/components/ui/Card";
import { Icon } from "@/components/ui/Icon";
import type { IconName } from "@/components/ui/icons";
import type { Explain } from "@/features/questions/types";
import { colors } from "@/theme";

export type ExplainMode = "story" | "picture" | "real";

export const EXPLAIN_MODES: { id: ExplainMode; label: string; icon: IconName; tone: "lavender" | "sky" | "peach" }[] = [
  { id: "story", label: "Photo story", icon: "cakeSlice", tone: "lavender" },
  { id: "picture", label: "Picture", icon: "hash", tone: "sky" },
  { id: "real", label: "Real life", icon: "mapPin", tone: "peach" },
];

/** The words to read aloud for a mode. */
export function explainText(mode: ExplainMode, e: Explain): string {
  if (mode === "story") return e.story.map((p) => p.caption).join(" ");
  if (mode === "picture") return `${e.picture.big.replace("→", "then")}. ${e.picture.caption}`;
  return `${e.real.line1} ${e.real.line2}`;
}

/** One way of explaining an idea or a question. Same look on Learn and on the hint screen. */
export function ExplainCard({ mode, explain }: { mode: ExplainMode; explain: Explain }) {
  if (mode === "story") {
    return (
      <View className="gap-3">
        {explain.story.map((panel, i) => (
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
    );
  }

  if (mode === "picture") {
    return (
      <Card tone="sky" className="items-center gap-3 py-8">
        <AppText weight="bold" className="text-center text-[34px] leading-[44px]">
          {explain.picture.big}
        </AppText>
        <AppText weight="semibold" className="text-center text-[22px] leading-8">
          {explain.picture.caption}
        </AppText>
      </Card>
    );
  }

  return (
    <Card tone="peach" className="items-center gap-3 py-6">
      <Icon name={explain.real.icon} size={56} color={colors.ink} />
      <AppText weight="semibold" className="text-center text-[22px] leading-8">
        {explain.real.line1}
      </AppText>
      <AppText className="text-center text-xl leading-8">{explain.real.line2}</AppText>
    </Card>
  );
}