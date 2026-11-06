import type { Stack } from "expo-router";
import type { ComponentProps } from "react";

import { colors } from "@/theme";

/**
 * One place to style every stack (root, student, teacher, and any you add).
 * Change the animation or background here and the whole app follows.
 */
export const stackOptions: ComponentProps<typeof Stack>["screenOptions"] = {
  headerShown: false, // our screens draw their own <Header />
  animation: "slide_from_right",
  contentStyle: { backgroundColor: colors.canvas },
};
