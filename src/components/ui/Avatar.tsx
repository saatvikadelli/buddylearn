import { View } from "react-native";

import { colors } from "@/theme";

import { AppText } from "./AppText";

export type AvatarTone = "butter" | "blush" | "mint" | "sky" | "peach" | "lavender";

type Props = { name: string; tone: AvatarTone; size?: number };

/** Coloured circle with the first letter of the name. */
export function Avatar({ name, tone, size = 60 }: Props) {
  return (
    <View
      className="items-center justify-center"
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: colors[tone],
      }}
    >
      <AppText weight="semibold" style={{ fontSize: size * 0.43 }}>
        {name.charAt(0).toUpperCase()}
      </AppText>
    </View>
  );
}
