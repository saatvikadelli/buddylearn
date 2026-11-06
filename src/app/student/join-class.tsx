import { useRouter } from "expo-router";
import { useState } from "react";
import { Alert, View } from "react-native";

import { AppText } from "@/components/ui/AppText";
import { Button } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Chip";
import { Header } from "@/components/ui/Header";
import { Icon } from "@/components/ui/Icon";
import { Screen } from "@/components/ui/Screen";
import { findClassByCode } from "@/data/mockClasses";
import { CodeInput } from "@/features/join-class/CodeInput";
   import { useSession } from "@/features/session/SessionContext";
import { StudentTile } from "@/features/join-class/StudentTile";
import { colors } from "@/theme";

const CODE_LENGTH = 6;

/** Student onboarding, screen 1: type the class code, then tap your own name. */
export default function JoinClassScreen() {
  const router = useRouter();

     const { signIn } = useSession();
  const [code, setCode] = useState("");
  const [studentId, setStudentId] = useState<string | null>(null);

  const complete = code.length === CODE_LENGTH;
  const schoolClass = complete ? findClassByCode(code) : null;
  const notFound = complete && !schoolClass;

  const onCodeChange = (next: string) => {
    setCode(next);
    setStudentId(null); // a different code means a different class
  };

  const onScanQr = () => {
    // TODO: open the camera (expo-camera) and fill the code from the QR.
    Alert.alert("Scan QR", "QR scanning will be added soon. Please type the code for now.");
  };

    const onContinue = () => {
     if (!schoolClass || !studentId) return;
     signIn(schoolClass.code, studentId);
     router.push("/student/comfort");
   };

  return (
    <Screen scroll>
      <Header title="Join your class" step="Step 1 of 2" />

      {/* Class code */}
      <View className="gap-3 rounded-card bg-lavender p-[18px]">
        <AppText weight="semibold" className="text-base">
          Class code from your teacher
        </AppText>

        <CodeInput value={code} onChange={onCodeChange} length={CODE_LENGTH} />

        <View className="flex-row items-center justify-between gap-3">
          <View
            className="flex-1 flex-row items-center gap-2"
            accessibilityLiveRegion="polite"
          >
            {schoolClass ? (
              <>
                <Icon name="check" size={22} color={colors.ink} />
                <AppText weight="medium" className="text-[15px]">
                  {schoolClass.name} found
                </AppText>
              </>
            ) : notFound ? (
              <>
                <Icon name="circleAlert" size={22} color={colors.clay} />
                <AppText weight="medium" className="flex-1 text-[15px]">
                  We can't find that class. Check the code with your teacher.
                </AppText>
              </>
            ) : (
              <AppText tone="soft" className="flex-1 text-sm leading-5">
                Type the 6 letters and numbers.
              </AppText>
            )}
          </View>
          <Chip label="Scan QR" icon="scanQrCode" onPress={onScanQr} />
        </View>
      </View>

      {/* Names */}
      {schoolClass ? (
        <>
          <AppText weight="semibold" className="text-xl">
            Tap your name
          </AppText>
          <View className="-mx-1 flex-row flex-wrap">
            {schoolClass.students.map((student) => (
              <View key={student.id} className="w-1/3 px-1 pb-2">
                <StudentTile
                  student={student}
                  selected={studentId === student.id}
                  onPress={() => setStudentId(student.id)}
                />
              </View>
            ))}
          </View>
        </>
      ) : null}

      <View className="min-h-4 flex-1" />

      <AppText tone="muted" className="text-center text-sm">
        No password to remember. Your teacher can reset anything.
      </AppText>
      <Button
        label="That's me"
        disabled={!studentId}
        onPress={onContinue}
        className={studentId ? "" : "opacity-40"}
      />
    </Screen>
  );
}
