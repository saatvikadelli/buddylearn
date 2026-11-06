import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { Pressable, Share, TextInput, View } from "react-native";

import { AppText } from "@/components/ui/AppText";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Chip } from "@/components/ui/Chip";
import { Header } from "@/components/ui/Header";
import { Icon } from "@/components/ui/Icon";
import { Screen } from "@/components/ui/Screen";
import { StepBar } from "@/components/ui/StepBar";
import { TextField } from "@/components/ui/TextField";
import { generateClassCode } from "@/data/mockClasses";
import { SYLLABUS, type BookId } from "@/data/syllabus";
import { parseNames } from "@/features/teacher/parseNames";
import { useTeacher } from "@/features/teacher/TeacherContext";
import { colors } from "@/theme";

// Full class names so Tailwind can find them.
const TONE_BG: Record<string, string> = {
  mint: "bg-mint",
  lavender: "bg-lavender",
  butter: "bg-butter",
  peach: "bg-peach",
  blush: "bg-blush",
  sky: "bg-sky",
};

export default function TeacherSetupScreen() {
  const router = useRouter();
  const { createClass } = useTeacher();

  const [className, setClassName] = useState("");
  const [bookIds, setBookIds] = useState<BookId[]>(["maths"]);
  const [namesText, setNamesText] = useState("");
  const code = useMemo(() => generateClassCode(), []);

  const names = useMemo(() => parseNames(namesText), [namesText]);
  const ready = className.trim().length > 0 && bookIds.length > 0 && names.length > 0;

  const toggleBook = (id: BookId) =>
    setBookIds((ids) => (ids.includes(id) ? ids.filter((b) => b !== id) : [...ids, id]));

  const onShare = () =>
    Share.share({ message: `Join my class on BuddyLearn. Class code: ${code}` });

  const onFinish = () => {
    if (!ready) return;
    createClass({ name: className.trim(), code, bookIds, studentNames: names });
    router.replace("/teacher/home");
  };

  return (
    <Screen scroll>
      <Header title="Set up your class" step="Step 3 of 3" hideBack />
      <StepBar total={3} current={3} />

      <TextField
        label="Class name"
        placeholder="e.g. Class 5A"
        autoCapitalize="words"
        value={className}
        onChangeText={setClassName}
      />

      <AppText weight="semibold" className="text-base">
        Which books will you use?
      </AppText>
      <View className="-mx-1 flex-row flex-wrap">
        {SYLLABUS.map((book) => {
          const on = bookIds.includes(book.id);
          return (
            <View key={book.id} className="w-1/2 p-1">
              <Pressable
                accessibilityRole="checkbox"
                accessibilityState={{ checked: on }}
                accessibilityLabel={`${book.subject}, ${book.title}`}
                onPress={() => toggleBook(book.id)}
                className={`gap-0.5 rounded-card px-3.5 py-3 ${
                  on ? `border-[3px] border-ink ${TONE_BG[book.tone]}` : "border-2 border-line bg-surface"
                }`}
              >
                <AppText weight="semibold" className="text-lg">
                  {book.subject}
                </AppText>
                <AppText className="text-sm">{book.titleNative ?? book.title}</AppText>
                <AppText weight="semibold" className="text-sm">
                  {book.chapters.length} chapters
                </AppText>
                {on ? (
                  <View className="absolute right-2.5 top-2.5 h-6 w-6 items-center justify-center rounded-full bg-ink">
                    <Icon name="check" size={14} color={colors.surface} />
                  </View>
                ) : null}
              </Pressable>
            </View>
          );
        })}
      </View>

      <AppText weight="semibold" className="text-base">
        Add your students
      </AppText>
      <Card className="gap-2.5 p-3.5">
        <TextInput
          value={namesText}
          onChangeText={setNamesText}
          multiline
          textAlignVertical="top"
          placeholder={"One first name per line,\nor separate with commas"}
          placeholderTextColor={colors.inkMuted}
          accessibilityLabel="Student first names"
          className="min-h-[120px] font-lexend text-base leading-6 text-ink"
        />
        <View className="flex-row items-center gap-2">
          <Icon name="users" size={20} color={colors.ink} />
          <AppText weight="medium" className="text-sm">
            {names.length === 0
              ? "No names yet"
              : `${names.length} first ${names.length === 1 ? "name" : "names"} added`}
          </AppText>
        </View>
      </Card>

      <Card tone="lavender" className="flex-row items-center justify-between gap-3">
        <View>
          <AppText className="text-sm">Class code for children</AppText>
          <AppText weight="bold" className="text-[26px] tracking-[4px]">
            {code}
          </AppText>
        </View>
        <Chip label="Share" icon="shareIcon" onPress={onShare} />
      </Card>

      <View className="min-h-4 flex-1" />
      <Button
        label="Finish setup"
        disabled={!ready}
        className={ready ? "" : "opacity-40"}
        onPress={onFinish}
      />
    </Screen>
  );
}