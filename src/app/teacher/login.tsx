import { useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, View } from "react-native";

import { AppText } from "@/components/ui/AppText";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Header } from "@/components/ui/Header";
import { Icon } from "@/components/ui/Icon";
import { Screen } from "@/components/ui/Screen";
import { TextField } from "@/components/ui/TextField";
import { DEMO_PHONE, useTeacher } from "@/features/teacher/TeacherContext";
import { colors } from "@/theme";

const PHONE_OK = /^[6-9]\d{9}$/;

export default function TeacherLoginScreen() {
  const router = useRouter();
  const { startSignIn } = useTeacher();
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");

  const onSend = () => {
    if (!PHONE_OK.test(phone)) {
      setError("Enter your 10-digit mobile number.");
      return;
    }
    if (!startSignIn(phone)) {
      setError("We can't find this number. Create an account first.");
      return;
    }
    router.push("/teacher/verify");
  };

  return (
    <Screen scroll>
      <Header title="Sign in" step="Teacher" />

      <Card tone="sky" className="gap-1.5 rounded-hero px-5 py-5">
        <AppText weight="semibold" className="text-[26px] leading-8">
          Welcome back
        </AppText>
        <AppText className="text-base leading-6">We will send a code to your phone.</AppText>
      </Card>

      <Card className="gap-4">
        <TextField
          label="Mobile number"
          prefix="+91"
          placeholder="10-digit number"
          keyboardType="number-pad"
          maxLength={10}
          value={phone}
          onChangeText={(t) => {
            setPhone(t.replace(/\D/g, ""));
            setError("");
          }}
          error={error}
        />
        <Button label="Send OTP" onPress={onSend} />
        <AppText tone="muted" className="text-center text-sm">
          Demo account: {DEMO_PHONE}
        </AppText>
      </Card>

      <Pressable accessibilityRole="link" onPress={() => router.push("/teacher/sign-up")} className="items-center py-2">
        <AppText weight="semibold" className="text-base underline">
          New here? Create an account
        </AppText>
      </Pressable>

      <View className="min-h-4 flex-1" />
      <View className="flex-row items-start gap-3 px-1">
        <Icon name="shieldCheck" size={26} color={colors.ink} />
        <AppText className="flex-1 text-sm leading-5">
          We keep only first names and learning progress. No labels are shown to children.
        </AppText>
      </View>
    </Screen>
  );
}