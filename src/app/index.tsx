import { useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, View } from "react-native";

import { FriendsHero } from "@/components/illustrations/FriendsHero";
import { AppText } from "@/components/ui/AppText";
import { Button } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Chip";
import { Icon } from "@/components/ui/Icon";
import { Screen } from "@/components/ui/Screen";
import { LANGUAGES } from "@/constants/languages";
import { colors } from "@/theme";

/** Page 1: Welcome. The child or teacher chooses who they are. */
export default function Welcome() {
  const router = useRouter();
  const [langIndex, setLangIndex] = useState(0);
  const language = LANGUAGES[langIndex];

  // TODO: replace with a language picker and app-wide language state.
  const nextLanguage = () => setLangIndex((i) => (i + 1) % LANGUAGES.length);

  return (
    <Screen scroll>
      {/* Header: logo and language */}
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center gap-2.5">
          <View className="h-11 w-11 items-center justify-center rounded-full bg-ink">
            <Icon name="sprout" size={24} color={colors.surface} />
          </View>
          <AppText weight="semibold" className="text-[22px]">
            BuddyLearn
          </AppText>
        </View>
        <Chip
          label={language.label}
          icon="globe"
          onPress={nextLanguage}
          accessibilityLabel="Change language"
        />
      </View>

      {/* Hero */}
      <View className="items-center rounded-hero bg-mint px-2.5 pb-2 pt-4">
        <FriendsHero />
      </View>

      <AppText weight="semibold" className="text-[32px] leading-10">
        Learn together, at your own pace.
      </AppText>
      <AppText tone="soft" className="text-base leading-6">
        Short practice that adjusts to you, and missions you do with a friend.
      </AppText>

      <View className="min-h-4 flex-1" />

      {/* Who are you? */}
      <Button label="I'm a student" onPress={() => router.push("/student/join-class")} />
      <Button
        label="I'm a teacher"
        variant="secondary"
        onPress={() => router.push("/teacher/login")}
      />
      <Pressable
        accessibilityRole="link"
        onPress={() => router.push("/teacher/sign-up")}
        className="items-center py-2"
      >
        <AppText weight="semibold" className="text-base underline">
          New teacher? Create an account
        </AppText>
      </Pressable>

      {/* Language list */}
      <View className="flex-row flex-wrap items-center justify-center gap-x-1">
        {LANGUAGES.map((item, index) => (
          <Pressable
            key={item.code}
            accessibilityRole="button"
            accessibilityState={{ selected: index === langIndex }}
            onPress={() => setLangIndex(index)}
            className="px-2.5 py-2"
          >
            <AppText
              weight={index === langIndex ? "semibold" : "regular"}
              tone={index === langIndex ? "default" : "muted"}
              className="text-sm"
            >
              {item.label}
            </AppText>
          </Pressable>
        ))}
      </View>
    </Screen>
  );
}
