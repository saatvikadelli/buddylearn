import { usePathname, useRouter } from "expo-router";
import { Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Icon } from "@/components/ui/Icon";
import { useSession } from "@/features/session/SessionContext";
import { useTeacher } from "@/features/teacher/TeacherContext";
import { colors } from "@/theme";

/** PROTOTYPE ONLY. Set to false (or remove <PrototypeSwitch /> from app/_layout.tsx) before a real release. */
export const SHOW_PROTOTYPE_SWITCH = true;

/**
 * A small ⇄ tab on the right edge of every screen, for demos.
 * Tap it to jump to the other side of the app:
 *  - on a student screen → teacher Home (or teacher sign-in if not signed in yet)
 *  - on a teacher screen → student Home (or "Join your class" if no child is signed in)
 * Both sides stay signed in, so you can switch back and forth.
 * Hidden on the start screen, where you choose student or teacher anyway.
 */
export function PrototypeSwitch() {
  const router = useRouter();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();
  const { studentId } = useSession();
  const { teacher } = useTeacher();

  if (!SHOW_PROTOTYPE_SWITCH || pathname === "/") return null;

  const onTeacherSide = pathname.startsWith("/teacher");
  const target = onTeacherSide
    ? studentId
      ? "/student/home"
      : "/student/join-class"
    : teacher
      ? "/teacher/home"
      : "/teacher/login";

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={onTeacherSide ? "Prototype: switch to the student side" : "Prototype: switch to the teacher side"}
      onPress={() => {
        if (router.canDismiss()) router.dismissAll();
        router.replace(target);
      }}
      hitSlop={8}
      className="absolute right-0 h-12 w-10 items-center justify-center rounded-l-full bg-ink opacity-70 active:opacity-100"
      // Upper third of the screen: clear of headers at the top and of buttons and tab bars at the bottom.
      style={{ top: insets.top + 150 }}
    >
      <Icon name="arrowLeftRight" size={20} color={colors.surface} />
    </Pressable>
  );
}