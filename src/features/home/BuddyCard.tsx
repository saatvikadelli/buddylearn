import { View } from "react-native";

import { AppText } from "@/components/ui/AppText";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Icon } from "@/components/ui/Icon";
import type { BuddySession } from "@/data/buddy";
import { colors } from "@/theme";

type Props = {
  session: BuddySession | null; // what the teacher planned, or null
  requested: boolean; // has the child already asked the teacher?
  onAsk: () => void;
  onOpen: () => void;
};

export function BuddyCard({ session, requested, onAsk, onOpen }: Props) {
  if (session) {
    return (
      <Card tone="blush" className="gap-3">
        <View className="flex-row items-center gap-3">
          <View className="h-[52px] w-[52px] items-center justify-center rounded-full bg-surface">
            <Icon name="users" size={26} color={colors.ink} />
          </View>
          <View className="flex-1">
            <AppText className="text-sm">Buddy mission planned</AppText>
            <AppText weight="semibold" className="text-[19px]">
              {session.title}
            </AppText>
          </View>
        </View>
        <View className="flex-row items-center gap-2">
          <Icon name="calendarDays" size={20} color={colors.ink} />
          <AppText weight="medium" className="text-[15px]">
            With {session.buddyName} · {session.when}
          </AppText>
        </View>
        <AppText className="text-sm">{session.topic}</AppText>
        <Button label="See details" onPress={onOpen} />
      </Card>
    );
  }

  if (requested) {
    return (
      <Card tone="white" className="flex-row items-center gap-3">
        <View className="h-[52px] w-[52px] items-center justify-center rounded-full bg-mint">
          <Icon name="check" size={26} color={colors.ink} />
        </View>
        <View className="flex-1">
          <AppText weight="semibold" className="text-[17px]">
            Request sent
          </AppText>
          <AppText tone="soft" className="text-sm leading-5">
            Your teacher will see it and plan a buddy mission.
          </AppText>
        </View>
      </Card>
    );
  }

  return (
    <Card tone="blush" className="gap-3">
      <View className="flex-row items-center gap-3">
        <View className="h-[52px] w-[52px] items-center justify-center rounded-full bg-surface">
          <Icon name="users" size={26} color={colors.ink} />
        </View>
        <View className="flex-1">
          <AppText weight="semibold" className="text-[17px]">
            No buddy mission yet
          </AppText>
          <AppText className="text-sm leading-5">
            Your teacher plans these. Ask them to set one up.
          </AppText>
        </View>
      </View>
      <Button variant="secondary" icon="send" label="Ask my teacher" onPress={onAsk} />
    </Card>
  );
}