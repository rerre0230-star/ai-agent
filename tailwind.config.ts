import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        office: {
          floor: "#f3f1ea",
          floordark: "#1c2029",
          wall: "#ffffff",
          walldark: "#151821",
        },
      },
      keyframes: {
        "bubble-in": {
          "0%": { opacity: "0", transform: "translateY(4px) scale(0.9)" },
          "100%": { opacity: "1", transform: "translateY(0) scale(1)" },
        },
        blink: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.35" },
        },
        typing: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-1px)" },
        },
      },
      animation: {
        "bubble-in": "bubble-in 0.15s ease-out",
        blink: "blink 1.6s ease-in-out infinite",
        typing: "typing 0.3s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
