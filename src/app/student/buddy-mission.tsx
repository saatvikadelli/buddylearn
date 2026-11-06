import { useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, View } from "react-native";

import { AppText } from "@/components/ui/AppText";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Icon } from "@/components/ui/Icon";
import { IconButton } from "@/components/ui/IconButton";
import type { IconName } from "@/components/ui/icons";
import { Screen } from "@/components/ui/Screen";
import { getBuddySession } from "@/data/buddy";
import { ReadAloudButton } from "@/features/learn/ReadAloudButton";
import { useSession } from "@/features/session/SessionContext";
import { colors } from "@/theme";

/** DEMO chests: one child sees the picture, the other sees the word with a letter missing. */
const CHESTS: { icon: IconName; word: string; options: string[]; answer: string }[] = [
  { icon: "cat", word: "c_t", options: ["a", "e", "o"], answer: "a" },
  { icon: "sun", word: "s_n", options: ["o", "u", "a"], answer: "u" },
  { icon: "dog", word: "d_g", options: ["i", "o", "u"], answer: "o" },
];
const SWAP_AFTER = 2; // roles swap after this many chests

export default function BuddyMissionScreen() {
  const router = useRouter();
  const { student, completeBuddyMission } = useSession();
  const session = getBuddySession(student?.id);

  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [tryAgain, setTryAgain] = useState(false);
  const [finished, setFinished] = useState(false);

  const me = student?.name ?? "You";
  const buddy = session?.buddyName ?? "Buddy";
  const swapped = index >= SWAP_AFTER;
  const pictureOwner = swapped ? buddy : me;
  const lettersOwner = swapped ? me : buddy;
  const chest = CHESTS[index];

  const onOpen = () => {
    if (!picked) return;
    if (picked !== chest.answer) {
      setTryAgain(true);
      setPicked(null);
      return;
    }
    setTryAgain(false);
    setPicked(null);
    if (index + 1 < CHESTS.length) {
      setIndex(index + 1);
    } else {
      completeBuddyMission();
      setFinished(true);
    }
  };

  if (finished) {
    return (
      <Screen>
        <View className="flex-1 items-center justify-center gap-4">
          <Card tone="mint" className="items-center gap-3 rounded-hero px-6 py-10">
            <Icon name="trophy" size={72} color={colors.ink} />
            <AppText weight="semibold" className="text-center text-[30px] leading-10">
              You opened all the chests!
            </AppText>
            <AppText className="text-center text-lg">You and {buddy} earned 2 stars. The class garden grew.</AppText>
          </Card>
        </View>
        <Button label="Back to home" onPress={() => router.replace("/student/home")} />
      </Screen>
    );
  }

  return (
    <Screen scroll>
      <View className="flex-row items-center gap-3.5">
        <IconButton icon="x" label="Close and go home" onPress={() => router.replace("/student/home")} />
        <View className="flex-1">
          <AppText tone="muted" className="text-sm">
            Buddy mission
          </AppText>
          <AppText weight="semibold" className="text-xl">
            Chest {index + 1} of {CHESTS.length}
          </AppText>
        </View>
      </View>

      <Card tone="lavender" className="items-center px-4 py-3.5">
        <AppText weight="semibold" className="text-center text-lg">
          Talk together. Find the missing letter.
        </AppText>
      </Card>

      <View className="flex-row gap-3">
        <Card tone="mint" className="flex-1 items-center gap-2.5 px-2.5 py-4">
          <AppText weight="semibold" className="text-center text-[15px]">
            {pictureOwner} sees the picture
          </AppText>
          <View className="h-[110px] items-center justify-center">
            <Icon name={chest.icon} size={88} color={colors.ink} />
          </View>
        </Card>
        <Card tone="peach" className="flex-1 items-center gap-2.5 px-2.5 py-4">
          <AppText weight="semibold" className="text-center text-[15px]">
            {lettersOwner} sees the letters
          </AppText>
          <View className="h-[110px] items-center justify-center">
            <AppText weight="bold" className="text-[52px] tracking-[4px]">
              {chest.word}
            </AppText>
          </View>
        </Card>
      </View>

      <View className="flex-row">
        <ReadAloudButton text={`Find the missing letter in ${chest.word.replace("_", " blank ")}`} key={index} />
      </View>

      <AppText tone="soft" className="text-center text-base">
        Pick the letter you both agree on
      </AppText>
      <View className="flex-row gap-3">
        {chest.options.map((letter) => (
          <Pressable
            key={letter}
            accessibilityRole="button"
            accessibilityLabel={`Letter ${letter}`}
            accessibilityState={{ selected: picked === letter }}
            onPress={() => setPicked(letter)}
            className={`h-20 flex-1 items-center justify-center rounded-card ${
              picked === letter ? "border-[3px] border-ink bg-surface" : "border-2 border-line bg-surface"
            }`}
          >
            <AppText weight="bold" className="text-[40px]">
              {letter}
            </AppText>
          </Pressable>
        ))}
      </View>

      {tryAgain ? (
        <Card tone="butter">
          <AppText weight="medium" className="text-base leading-6">
            Not quite. Talk about it again and try another letter.
          </AppText>
        </Card>
      ) : null}

      <AppText tone="muted" className="text-center text-sm">
        {swapped ? "Roles swapped. Now you both read and listen." : `Roles swap after chest ${SWAP_AFTER}.`}
      </AppText>

      <View className="min-h-4 flex-1" />
      <Button
        label="Open the chest"
        disabled={!picked}
        className={picked ? "" : "opacity-40"}
        onPress={onOpen}
      />
    </Screen>
  );
}