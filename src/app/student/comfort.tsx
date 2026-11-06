import { useRouter } from "expo-router";
import { Pressable, View } from "react-native";

import { AppText } from "@/components/ui/AppText";
import { Button } from "@/components/ui/Button";
import { Header } from "@/components/ui/Header";
import { Screen } from "@/components/ui/Screen";
import { SCREEN_TINTS } from "@/constants/comfort";
import { ComfortToggle } from "@/features/comfort/ComfortToggle";
import { useSession } from "@/features/session/SessionContext";

type ToggleKey = "readAloud" | "biggerLetters" | "fewerWords" | "shortSessions";

export default function ComfortScreen() {
  const router = useRouter();
  const { comfort, updateComfort } = useSession();

  const toggle = (key: ToggleKey) => updateComfort({ [key]: !comfort[key] });

  const onStart = () => {
    // Remove the onboarding screens from the back stack, then open Home.
    router.dismissAll();
    router.replace("/student/home");
  };

  return (
    <Screen scroll>
      <Header title="Make it comfy" step="Step 2 of 2" />

      <View className="gap-1.5 rounded-card border-2 border-ink bg-butter px-5 py-[18px]">
        <AppText className="text-sm">This is how your screen will look</AppText>
        <AppText
          weight="medium"
          className={comfort.biggerLetters ? "text-[26px] leading-10" : "text-xl leading-8"}
          style={{ letterSpacing: 0.5 }}
        >
          Which is the same as one half?
        </AppText>
      </View>

      <View className="flex-row gap-3">
        <View className="flex-1">
          <ComfortToggle label="Read it to me" icon="volume2" value={comfort.readAloud} onToggle={() => toggle("readAloud")} />
        </View>
        <View className="flex-1">
          <ComfortToggle label="Bigger letters" glyph="Aa" value={comfort.biggerLetters} onToggle={() => toggle("biggerLetters")} />
        </View>
      </View>
      <View className="flex-row gap-3">
        <View className="flex-1">
          <ComfortToggle label="Fewer words" icon="alignLeft" value={comfort.fewerWords} onToggle={() => toggle("fewerWords")} />
        </View>
        <View className="flex-1">
          <ComfortToggle label="Short sessions" icon="timer" value={comfort.shortSessions} onToggle={() => toggle("shortSessions")} />
        </View>
      </View>

      <AppText weight="semibold" className="text-base">
        Screen colour
      </AppText>
      <View className="flex-row gap-3.5">
        {SCREEN_TINTS.map((item) => {
          const selected = item.id === comfort.tint;
          return (
            <Pressable
              key={item.id}
              accessibilityRole="button"
              accessibilityLabel={item.label}
              accessibilityState={{ selected }}
              onPress={() => updateComfort({ tint: item.id })}
              className={`h-14 w-14 rounded-full ${selected ? "border-4 border-ink" : "border-2 border-line-strong"}`}
              style={{ backgroundColor: item.color }}
            />
          );
        })}
      </View>

      <View className="min-h-4 flex-1" />

      <AppText tone="muted" className="text-center text-sm">
        You can change these any time.
      </AppText>
      <Button label="Start learning" onPress={onStart} />
    </Screen>
  );
}