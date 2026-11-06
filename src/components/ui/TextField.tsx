import { TextInput, View, type TextInputProps } from "react-native";

import { colors } from "@/theme";

import { AppText } from "./AppText";

type Props = TextInputProps & {
  label: string;
  error?: string;
  /** Fixed text shown before the input, e.g. "+91". */
  prefix?: string;
};

export function TextField({ label, error, prefix, ...inputProps }: Props) {
  return (
    <View className="gap-1.5">
      <AppText weight="semibold" className="text-[15px]">
        {label}
      </AppText>
      <View className="flex-row gap-2">
        {prefix ? (
          <View className="h-[58px] min-w-[64px] items-center justify-center rounded-[18px] border-2 border-line-strong bg-canvas">
            <AppText className="text-lg">{prefix}</AppText>
          </View>
        ) : null}
        <TextInput
          accessibilityLabel={label}
          placeholderTextColor={colors.inkMuted}
          className={`h-[58px] flex-1 rounded-[18px] border-2 bg-surface px-4 font-lexend text-lg text-ink ${
            error ? "border-clay" : "border-line-strong"
          }`}
          {...inputProps}
        />
      </View>
      {error ? (
        <AppText className="text-sm" style={{ color: colors.clay }} accessibilityLiveRegion="polite">
          {error}
        </AppText>
      ) : null}
    </View>
  );
}