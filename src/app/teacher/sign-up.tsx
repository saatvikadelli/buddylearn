import { useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, View } from "react-native";

import { AppText } from "@/components/ui/AppText";
import { Button } from "@/components/ui/Button";
import { CheckRow } from "@/components/ui/CheckRow";
import { Chip } from "@/components/ui/Chip";
import { Header } from "@/components/ui/Header";
import { Screen } from "@/components/ui/Screen";
import { StepBar } from "@/components/ui/StepBar";
import { TextField } from "@/components/ui/TextField";
import { LANGUAGES, type LanguageCode } from "@/constants/languages";
import { useTeacher } from "@/features/teacher/TeacherContext";

const PHONE_OK = /^[6-9]\d{9}$/;

type Errors = { name?: string; school?: string; phone?: string };

export default function TeacherSignUpScreen() {
  const router = useRouter();
  const { startSignUp } = useTeacher();

  const [name, setName] = useState("");
  const [school, setSchool] = useState("");
  const [phone, setPhone] = useState("");
  const [language, setLanguage] = useState<LanguageCode>("en");
  const [consent, setConsent] = useState(false);
  const [errors, setErrors] = useState<Errors>({});

  const onCreate = () => {
    const next: Errors = {};
    if (!name.trim()) next.name = "Please enter your name.";
    if (!school.trim()) next.school = "Please enter your school name.";
    if (!PHONE_OK.test(phone)) next.phone = "Enter a 10-digit mobile number.";
    if (Object.keys(next).length) return setErrors(next);

    const ok = startSignUp({ name: name.trim(), school: school.trim(), phone, language });
    if (!ok) return setErrors({ phone: "This number already has an account. Please sign in." });
    router.push("/teacher/verify");
  };

  return (
    <Screen scroll>
      <Header title="Create your account" step="Step 1 of 3" />
      <StepBar total={3} current={1} />

      <TextField
        label="Your name"
        placeholder="Your name"
        autoCapitalize="words"
        value={name}
        onChangeText={(t) => {
          setName(t);
          setErrors((e) => ({ ...e, name: undefined }));
        }}
        error={errors.name}
      />
      <TextField
        label="School name"
        placeholder="School name"
        autoCapitalize="words"
        value={school}
        onChangeText={(t) => {
          setSchool(t);
          setErrors((e) => ({ ...e, school: undefined }));
        }}
        error={errors.school}
      />
      <TextField
        label="Mobile number"
        prefix="+91"
        placeholder="10-digit number"
        keyboardType="number-pad"
        maxLength={10}
        value={phone}
        onChangeText={(t) => {
          setPhone(t.replace(/\D/g, ""));
          setErrors((e) => ({ ...e, phone: undefined }));
        }}
        error={errors.phone}
      />

      <AppText weight="semibold" className="text-[15px]">
        App language
      </AppText>
      <View className="flex-row flex-wrap gap-2">
        {LANGUAGES.map((l) => (
          <Chip key={l.code} label={l.label} selected={l.code === language} onPress={() => setLanguage(l.code)} />
        ))}
      </View>

      <CheckRow checked={consent} onToggle={() => setConsent((c) => !c)}>
        <AppText className="text-sm leading-5">
          My school has parent permission to use this app. Only first names and learning progress are stored.
        </AppText>
      </CheckRow>

      <View className="min-h-4 flex-1" />
      <Button
        label="Create account"
        disabled={!consent}
        className={consent ? "" : "opacity-40"}
        onPress={onCreate}
      />
      <Pressable accessibilityRole="link" onPress={() => router.replace("/teacher/login")} className="items-center py-2">
        <AppText weight="semibold" className="text-base underline">
          Already have an account? Sign in
        </AppText>
      </Pressable>
    </Screen>
  );
}