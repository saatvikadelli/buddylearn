# BuddyLearn

Adaptive practice and buddy learning for Class 5 (CBSE). Expo + React Native + TypeScript.

## Run it

```bash
npm install
npx expo start        # scan the QR code with the Expo Go app on your phone
```

## Build an APK (competition demo)

```bash
npm install -g eas-cli
eas login
eas build -p android --profile preview    # profile "preview" produces an .apk
```

## Add a new page (you never edit the main app file)

```bash
npm run new:page -- student/make-it-comfy "Make it comfy"
```

This creates `src/app/student/make-it-comfy.tsx`. It is already part of the student stack.
Open it from any screen with `router.push("/student/make-it-comfy")`.

- A new folder gets its own `_layout.tsx` (its own stack) automatically.
- You can also create the file by hand: any `.tsx` file inside `src/app` is a screen.
- File name = URL. `[id].tsx` is a dynamic page (`/teacher/class/5A`).
- Never list screens in `src/app/_layout.tsx`. Stack look (animation, background) lives in
  `src/navigation/stackOptions.ts`.

## Where things live

```
src/
  app/                 screens (Expo Router: one file = one route)
    index.tsx          1. Welcome (student or teacher)
    student/           student stack (join-class is built, the rest are placeholders)
    teacher/           teacher stack
  components/
    ui/                Screen, Header, AppText, Button, Chip, IconButton, Avatar, Icon
    illustrations/     SVG artwork
  theme/tokens.json    colours + font names, the single source of truth
  theme/index.ts       the same colours as JS values (for SVG, StatusBar)
  features/            code that belongs to one feature (e.g. join-class/)
  data/                demo data (mockClasses.ts, demo code B5A472)
  navigation/          stackOptions.ts, shared stack styling
  constants/           languages and other fixed lists
tailwind.config.js     reads theme/tokens.json
```

## Rules we follow

- Use `<AppText>`, never `<Text>`: each font weight is its own Lexend file.
- Choose text colour with `tone="soft"` etc., sizes with `className="text-xl"`.
- Colours come from Tailwind names: `bg-mint`, `text-ink-soft`, `border-line`.
- Icons: add the import to `src/components/ui/icons.ts`, then `<Icon name="globe" />`.
