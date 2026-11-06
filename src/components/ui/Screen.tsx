import type { ReactNode } from "react";
import { ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { SCREEN_TINTS } from "@/constants/comfort";
import { useSession } from "@/features/session/SessionContext";

type Props = {
  children: ReactNode;
  /** Use scroll for long pages or pages with a keyboard. */
  scroll?: boolean;
  /** Add this on pages that show the floating bottom bar (Home, Books). */
  tabBar?: boolean;
  /** Force a background colour (hex). Normally leave this out. */
  background?: string;
  className?: string;
};

export function Screen({ children, scroll = false, tabBar = false, background, className = "" }: Props) {
  const insets = useSafeAreaInsets();
  const { comfort } = useSession();
  const tint = SCREEN_TINTS.find((t) => t.id === comfort.tint)?.color;
  const bg = { backgroundColor: background ?? tint };

  const padding = {
    paddingTop: insets.top + 8,
    // the floating bar is 72px tall plus its own margins
    paddingBottom: insets.bottom + (tabBar ? 108 : 16),
  };

  if (scroll) {
    return (
      <ScrollView
        className="flex-1"
        style={bg}
        contentContainerClassName={`flex-grow gap-4 px-5 ${className}`}
        contentContainerStyle={padding}
        keyboardShouldPersistTaps="handled"
        automaticallyAdjustKeyboardInsets
        showsVerticalScrollIndicator={false}
      >
        {children}
      </ScrollView>
    );
  }

  return (
    <View className={`flex-1 gap-4 px-5 ${className}`} style={[padding, bg]}>
      {children}
    </View>
  );
}