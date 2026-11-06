import { Tabs } from "expo-router";

import { PillTabBar } from "@/components/ui/PillTabBar";

/** The teacher's three main pages. One file in this folder = one tab. */
export default function TeacherTabsLayout() {
  return (
    <Tabs
      tabBar={(props) => <PillTabBar {...props} />}
      screenOptions={{ headerShown: false, sceneStyle: { backgroundColor: "transparent" } }}
    >
      <Tabs.Screen name="home" options={{ title: "Home" }} />
      <Tabs.Screen name="class" options={{ title: "Class" }} />
      <Tabs.Screen name="activities" options={{ title: "Activities" }} />
    </Tabs>
  );
}