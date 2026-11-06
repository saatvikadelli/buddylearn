import * as Speech from "expo-speech";
import { useCallback, useEffect, useState } from "react";

import { Chip } from "@/components/ui/Chip";

type Props = {
  text: string;
  /** Start reading as soon as the text appears (used when "Read it to me" is on). */
  autoPlay?: boolean;
};

export function ReadAloudButton({ text, autoPlay = false }: Props) {
  const [speaking, setSpeaking] = useState(false);

  const speak = useCallback(() => {
    Speech.stop();
    setSpeaking(true);
    Speech.speak(text, {
      language: "en-IN",
      rate: 0.85,
      onDone: () => setSpeaking(false),
      onStopped: () => setSpeaking(false),
      onError: () => setSpeaking(false),
    });
  }, [text]);

  const toggle = () => {
    if (speaking) {
      Speech.stop();
      setSpeaking(false);
    } else {
      speak();
    }
  };

  useEffect(() => {
    if (autoPlay) speak();
    return () => {
      Speech.stop();
    };
  }, [autoPlay, speak]);

  return <Chip label={speaking ? "Stop" : "Read to me"} icon="volume2" onPress={toggle} />;
}