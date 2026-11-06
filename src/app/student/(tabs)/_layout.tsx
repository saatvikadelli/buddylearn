import { Tabs } from "expo-router";

import { PillTabBar } from "@/components/ui/PillTabBar";

/**
 * Bottom bar for the student's main pages. Each file in this folder is one tab:
 * home.tsx -> Home, books.tsx -> Books. (The "(tabs)" folder name is not part of the URL.)
 */
export default function StudentTabsLayout() {
  return (
    <Tabs
      tabBar={(props) => <PillTabBar {...props} />}
      screenOptions={{ headerShown: false, sceneStyle: { backgroundColor: "transparent" } }}
    >
      <Tabs.Screen name="home" options={{ title: "Home" }} />
      <Tabs.Screen name="books" options={{ title: "Books" }} />
    </Tabs>
  );
}