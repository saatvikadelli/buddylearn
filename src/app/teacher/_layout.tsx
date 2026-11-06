import { Stack } from "expo-router";

import { stackOptions } from "@/navigation/stackOptions";

// Every .tsx file in this folder becomes a screen in this stack automatically.
export default function Layout() {
  return <Stack screenOptions={stackOptions} />;
}
