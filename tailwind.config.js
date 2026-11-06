const tokens = require("./src/theme/tokens.json");

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
   darkMode: "class", // we only have a light theme; this stops a web-only NativeWind error
  
  presets: [require("nativewind/preset")],
  theme: {
    extend: { 
      colors: tokens.colors,
      fontFamily: tokens.fontFamily,
      borderRadius: {
        card: "28px",
        hero: "36px",
      },
    },
  },
  plugins: [],
};
