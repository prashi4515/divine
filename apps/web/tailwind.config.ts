import type { Config } from "tailwindcss";
import animate from "tailwindcss-animate";
import divinePreset from "@divine/ui/tailwind-preset";

const config: Config = {
  presets: [divinePreset],
  darkMode: "class",
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    container: {
      center: true,
      padding: "1.5rem",
      screens: {
        "2xl": "1280px",
      },
    },
    extend: {},
  },
  plugins: [animate],
};

export default config;
