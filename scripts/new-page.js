#!/usr/bin/env node
/**
 * Creates a new screen and (if needed) the stack layout for its folder.
 *
 *   npm run new:page -- student/comfort "Make it comfy"
 *   npm run new:page -- teacher/class/[id] "Class details"
 *   npm run new:page -- settings "Settings"
 *
 * You never register the page anywhere else. Expo Router picks the file up by itself.
 */
const fs = require("fs");
const path = require("path");

const [, , routeArg, ...titleParts] = process.argv;
if (!routeArg) {
  console.log('Usage: npm run new:page -- <folder/page-name> "Screen title"');
  console.log('Example: npm run new:page -- student/comfort "Make it comfy"');
  process.exit(1);
}

const route = routeArg.replace(/^\/+|\/+$/g, "").replace(/\.tsx$/, "");
const segments = route.split("/");
const last = segments[segments.length - 1];
const appDir = path.join(__dirname, "..", "src", "app");
const file = path.join(appDir, ...segments) + ".tsx";
const rel = (p) => path.relative(path.join(__dirname, ".."), p);

if (fs.existsSync(file)) {
  console.error(`✖ ${rel(file)} already exists. Nothing changed.`);
  process.exit(1);
}

const words = last.replace(/[\[\]\.]/g, "").split(/[-_]/).filter(Boolean);
const cap = (w) => w.charAt(0).toUpperCase() + w.slice(1);
const componentName = words.map(cap).join("") + "Screen";
const title = titleParts.join(" ") || words.map(cap).join(" ");

const LAYOUT = `import { Stack } from "expo-router";

import { stackOptions } from "@/navigation/stackOptions";

// Every .tsx file in this folder becomes a screen in this stack automatically.
export default function Layout() {
  return <Stack screenOptions={stackOptions} />;
}
`;

const PAGE = `import { useRouter } from "expo-router";

import { AppText } from "@/components/ui/AppText";
import { Button } from "@/components/ui/Button";
import { Header } from "@/components/ui/Header";
import { Screen } from "@/components/ui/Screen";

export default function ${componentName}() {
  const router = useRouter();

  return (
    <Screen>
      <Header title="${title}" />

      <AppText tone="soft" className="text-base leading-6">
        TODO: build this screen.
      </AppText>

      {/* Go to another page: router.push("/student/some-page") */}
      <Button label="Continue" onPress={() => router.back()} />
    </Screen>
  );
}
`;

let dir = appDir;
for (const seg of segments.slice(0, -1)) {
  dir = path.join(dir, seg);
  fs.mkdirSync(dir, { recursive: true });
  const layout = path.join(dir, "_layout.tsx");
  if (!fs.existsSync(layout)) {
    fs.writeFileSync(layout, LAYOUT);
    console.log(`✔ created ${rel(layout)} (new stack for this folder)`);
  }
}
fs.writeFileSync(file, PAGE);
console.log(`✔ created ${rel(file)}`);
console.log(`\nOpen it with:  router.push("/${route}")`);
