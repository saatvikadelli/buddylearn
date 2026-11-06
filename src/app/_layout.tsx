import "../global.css";

import { Lexend_400Regular } from "@expo-google-fonts/lexend/400Regular";
import { Lexend_500Medium } from "@expo-google-fonts/lexend/500Medium";
import { Lexend_600SemiBold } from "@expo-google-fonts/lexend/600SemiBold";
import { Lexend_700Bold } from "@expo-google-fonts/lexend/700Bold";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";

import { stackOptions } from "@/navigation/stackOptions";
   import { SessionProvider } from "@/features/session/SessionContext";
      import { TeacherProvider } from "@/features/teacher/TeacherContext";
import { PrototypeSwitch } from "@/features/prototype/PrototypeSwitch";

// Keep the splash screen visible until the fonts are ready.
SplashScreen.preventAutoHideAsync();

/**
 * ROOT LAYOUT. You should almost never edit this file.
 * Do NOT list screens here. Expo Router finds every file inside src/app by itself:
 *   src/app/index.tsx            -> "/"            (Welcome)
 *   src/app/student/*.tsx        -> "/student/..." (own stack, see student/_layout.tsx)
 *   src/app/teacher/*.tsx        -> "/teacher/..." (own stack, see teacher/_layout.tsx)
 * To add a page, run:  npm run new:page -- student/my-page "My page"
 */
export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Lexend_400Regular,
    Lexend_500Medium,
    Lexend_600SemiBold,
    Lexend_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) SplashScreen.hideAsync();
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) return null;

  return (
    <SessionProvider>
       <TeacherProvider>
      <StatusBar style="dark" />
      <Stack screenOptions={stackOptions} />
      <PrototypeSwitch/></TeacherProvider>
    </SessionProvider>
  );
}
