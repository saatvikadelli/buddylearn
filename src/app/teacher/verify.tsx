import { useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, View } from "react-native";

import { AppText } from "@/components/ui/AppText";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Header } from "@/components/ui/Header";
import { Icon } from "@/components/ui/Icon";
import { Screen } from "@/components/ui/Screen";
import { StepBar } from "@/components/ui/StepBar";
import { CodeInput } from "@/features/join-class/CodeInput";
import { DEMO_OTP, useTeacher } from "@/features/teacher/TeacherContext";
import { colors } from "@/theme";

export default function VerifyScreen() {
  const router = useRouter();
  const { pendingFlow, pendingPhone, verifyOtp } = useTeacher();
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [resent, setResent] = useState(false);

  const isSignUp = pendingFlow === "signup";

  if (!pendingFlow) {
    return (
      <Screen>
        <Header title="Check your phone" />
        <AppText tone="soft" className="text-base">
          Start from sign in or create account.
        </AppText>
        <View className="flex-1" />
        <Button label="Go to sign in" onPress={() => router.replace("/teacher/login")} />
      </Screen>
    );
  }

  const onVerify = () => {
    const flow = verifyOtp(code);
    if (!flow) {
      setError("That code is not right. Try again.");
      return;
    }
    // Clear the sign-in screens from the back stack, then continue.
    router.dismissAll();
    router.replace(flow === "signup" ? "/teacher/setup" : "/teacher/home");
  };

  return (
    <Screen scroll>
      <Header title="Check your phone" step={isSignUp ? "Step 2 of 3" : "Teacher sign in"} />
      {isSignUp ? <StepBar total={3} current={2} /> : null}

      <Card tone="sky" className="gap-2 rounded-hero px-5 py-5">
        <View className="h-14 w-14 items-center justify-center rounded-full bg-surface">
          <Icon name="smartphone" size={28} color={colors.ink} />
        </View>
        <AppText weight="semibold" className="text-2xl leading-8">
          We sent you a 6-digit code
        </AppText>
        <AppText className="text-base">Sent to +91 {pendingPhone}</AppText>
      </Card>

      <CodeInput
        numeric
        outlined
        value={code}
        onChange={(c) => {
          setCode(c);
          setError("");
        }}
      />
      {error ? (
        <AppText className="text-sm" style={{ color: colors.clay }} accessibilityLiveRegion="polite">
          {error}
        </AppText>
      ) : null}

      <Pressable accessibilityRole="link" onPress={() => setResent(true)} className="self-start py-1">
        <AppText weight="semibold" className="text-base underline">
          {resent ? "Code sent again" : "Resend the code"}
        </AppText>
      </Pressable>
      <AppText tone="muted" className="text-sm">
        Demo code: {DEMO_OTP}
      </AppText>

      <Card className="flex-row items-start gap-3 px-4 py-3">
        <Icon name="shieldCheck" size={24} color={colors.ink} />
        <AppText className="flex-1 text-sm leading-5">
          Children never create accounts. You add them, and they join with a class code.
        </AppText>
      </Card>

      <View className="min-h-4 flex-1" />
      <Button
        label="Verify and continue"
        disabled={code.length < 6}
        className={code.length < 6 ? "opacity-40" : ""}
        onPress={onVerify}
      />
    </Screen>
  );
}