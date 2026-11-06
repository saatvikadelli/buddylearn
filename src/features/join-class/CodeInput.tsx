import { useRef, useState, type ComponentRef } from "react";
import { Pressable, TextInput, View } from "react-native";

import { AppText } from "@/components/ui/AppText";

type Props = {
  value: string;
  onChange: (code: string) => void;
  length?: number;
  /** Digits only (for the phone code). */
  numeric?: boolean;
  /** Draw a visible border around every box (for use on a plain background). */
  outlined?: boolean;
};

export function CodeInput({ value, onChange, length = 6, numeric = false, outlined = false }: Props) {
  const inputRef = useRef<ComponentRef<typeof TextInput>>(null);
  const [focused, setFocused] = useState(false);
  const activeIndex = Math.min(value.length, length - 1);

  return (
    <View>
      <Pressable
        onPress={() => inputRef.current?.focus()}
        accessible={false}
        className="flex-row gap-2"
      >
        {Array.from({ length }, (_, i) => (
          <View
            key={i}
            className={`h-[60px] flex-1 items-center justify-center rounded-2xl border-2 bg-surface ${
              focused && i === activeIndex ? "border-ink" : outlined ? "border-line-strong" : "border-transparent"
            }`}
          >
            <AppText weight="semibold" className="text-[26px]">
              {value[i] ?? ""}
            </AppText>
          </View>
        ))}
      </Pressable>

      <TextInput
        ref={inputRef}
        value={value}
        onChangeText={(text) =>
          onChange(text.replace(numeric ? /\D/g : /[^a-zA-Z0-9]/g, "").toUpperCase().slice(0, length))
        }
        maxLength={length}
        autoFocus
        keyboardType={numeric ? "number-pad" : "default"}
        autoCapitalize="characters"
        autoCorrect={false}
        autoComplete="off"
        caretHidden
        returnKeyType="done"
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        accessibilityLabel="Class code"
        accessibilityHint="Type the six letters and numbers your teacher gave you"
        style={{ position: "absolute", width: 1, height: 1, opacity: 0 }}
      />
    </View>
  );
}