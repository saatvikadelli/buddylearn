import { AppText } from "./ui/AppText";
import { Header } from "./ui/Header";
import { Screen } from "./ui/Screen";

/** Temporary placeholder for screens we have not built yet. */
export function ComingNext({ title }: { title: string }) {
  return (
    <Screen>
      <Header title={title} />
      <AppText tone="soft" className="text-base leading-6">
        This screen is next on the list.
      </AppText>
    </Screen>
  );
}
