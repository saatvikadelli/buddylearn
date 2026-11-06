import type { Tabs } from "expo-router";
import type { ComponentProps } from "react";
import { Pressable, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { colors } from "@/theme";

import { AppText } from "./AppText";
import { Icon } from "./Icon";
import type { IconName } from "./icons";

type TabBarProps = Parameters<NonNullable<ComponentProps<typeof Tabs>["tabBar"]>>[0];

/** Add a tab: create the file in (tabs)/ and add one line here. */
const TAB_META: Record<string, { label: string; icon: IconName }> = {
  home: { label: "Home", icon: "house" },
  books: { label: "Books", icon: "bookOpen" },
    class: { label: "Class", icon: "users" },
  activities: { label: "Activities", icon: "lightbulb" },
};

export function PillTabBar({ state, emitter, navigateToTab }: TabBarProps) {
  const insets = useSafeAreaInsets();

  return (
    <View
      pointerEvents="box-none"
      className="absolute bottom-0 left-0 right-0 px-5"
      style={{ paddingBottom: insets.bottom + 12 }}
    >
      <View className="h-[72px] flex-row items-center justify-around rounded-full bg-ink px-2.5">
        {state.routes.map((route, index) => {
          const meta = TAB_META[route.name];
          if (!meta) return null;
          const focused = state.index === index;

          const onPress = () => {
            const event = emitter.emit({ type: "tabPress", target: route.key, canPreventDefault: true });
            if (!focused && !event.defaultPrevented) navigateToTab(route.key);
          };

          return (
            <Pressable
              key={route.key}
              accessibilityRole="tab"
              accessibilityLabel={meta.label}
              accessibilityState={{ selected: focused }}
              onPress={onPress}
              className={`h-[52px] min-w-[52px] flex-row items-center justify-center gap-2 rounded-full px-5 ${
                focused ? "bg-surface" : ""
              }`}
            >
              <Icon name={meta.icon} size={24} color={focused ? colors.ink : colors.surface} />
              {focused ? (
                <AppText weight="semibold" className="text-[15px]">
                  {meta.label}
                </AppText>
              ) : null}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}