const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const config = getDefaultConfig(__dirname);

// inlineRem: 16 keeps Tailwind sizes identical to the design (h-16 = 64px, text-xl = 20px).
module.exports = withNativeWind(config, {
  input: "./src/global.css",
  inlineRem: 16,
});
