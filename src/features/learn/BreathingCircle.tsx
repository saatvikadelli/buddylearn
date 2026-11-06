import { useEffect, useRef, useState } from "react";
import { Animated, Easing, View } from "react-native";

import { AppText } from "@/components/ui/AppText";
import { colors } from "@/theme";

export function BreathingCircle() {
  const scale = useRef(new Animated.Value(1)).current;
  const [inhale, setInhale] = useState(true);
  const [breath, setBreath] = useState(1);

  useEffect(() => {
    Animated.timing(scale, {
      toValue: inhale ? 1.25 : 1,
      duration: 4000,
      easing: Easing.inOut(Easing.ease),
      useNativeDriver: true,
    }).start();
    const timer = setTimeout(() => {
      if (!inhale) setBreath((b) => Math.min(b + 1, 3));
      setInhale((v) => !v);
    }, 4000);
    return () => clearTimeout(timer);
  }, [inhale, scale]);

  return (
    <View className="items-center gap-5">
      <Animated.View
        style={{
          width: 240,
          height: 240,
          borderRadius: 120,
          backgroundColor: colors.sky,
          alignItems: "center",
          justifyContent: "center",
          transform: [{ scale }],
        }}
      >
        <View
          style={{
            width: 160,
            height: 160,
            borderRadius: 80,
            backgroundColor: colors.mint,
            borderWidth: 3,
            borderColor: colors.ink,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <AppText weight="semibold" className="text-xl">
            {inhale ? "Breathe in" : "Breathe out"}
          </AppText>
        </View>
      </Animated.View>

      <View className="flex-row items-center gap-2.5">
        {[1, 2, 3].map((n) => (
          <View key={n} className={`h-3.5 w-3.5 rounded-full ${n <= breath ? "bg-ink" : "bg-line-strong"}`} />
        ))}
        <AppText tone="muted" className="ml-1.5 text-sm">
          Breath {breath} of 3
        </AppText>
      </View>
    </View>
  );
}