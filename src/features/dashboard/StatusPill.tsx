import { View } from "react-native";

import { AppText } from "@/components/ui/AppText";
import { Icon } from "@/components/ui/Icon";
import type { IconName } from "@/components/ui/icons";
import { STATUS_META, type Status } from "@/data/analytics";
import { colors } from "@/theme";

// Always an icon AND a word, so colour is never the only signal.
const LOOK: Record<Status, { bg: string; icon: IconName }> = {
  "on-track": { bg: "bg-mint", icon: "check" },
  nudge: { bg: "bg-butter", icon: "lightbulb" },
  ready: { bg: "bg-lavender", icon: "star" },
};

export function StatusPill({ status }: { status: Status }) {
  const look = LOOK[status];
  return (
    <View className={`h-9 flex-row items-center gap-1.5 rounded-full px-3 ${look.bg}`}>
      <Icon name={look.icon} size={16} color={colors.ink} />
      <AppText weight="semibold" className="text-[13px]">
        {STATUS_META[status].label}
      </AppText>
    </View>
  );
}