import type { Config } from "tailwindcss";
import { nextui } from "@nextui-org/theme";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./node_modules/@nextui-org/theme/dist/components/button.js",
  ],
  theme: {
    extend: {
      colors: {
        primaryRed: "#D32F2F",
        secondaryRed: "#EF5350",
        darkRed: "#B71C1C",
      },
    },
  },
  darkMode: "class",
  plugins: [require("@tailwindcss/forms"), nextui()],
};
export default config;
