import { useRouter } from "expo-router";
import { View } from "react-native";

import { AppText } from "./AppText";
import { IconButton } from "./IconButton";

type Props = {
  title: string;
  step?: string; // e.g. "Step 1 of 2"
  hideBack?: boolean;
  onBack?: () => void;
};

/** Top bar used by most screens: back button, small step text, title. */
export function Header({ title, step, hideBack = false, onBack }: Props) {
  const router = useRouter();

  const goBack = () => {
    if (onBack) return onBack();
    if (router.canGoBack()) router.back();
    else router.replace("/");
  };

  return (
    <View className="flex-row items-center gap-3">
      {hideBack ? null : <IconButton icon="arrowLeft" label="Back" onPress={goBack} />}
      <View className="flex-1">
        {step ? (
          <AppText tone="muted" className="text-sm">
            {step}
          </AppText>
        ) : null}
        <AppText weight="semibold" className="text-xl">
          {title}
        </AppText>
      </View>
    </View>
  );
}
