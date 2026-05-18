import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "#121212",
        panel: "#181818",
        panelAlt: "#1f1f1f",
        border: "#2a2a2a",
        accent: "#1DB954",
        accentHover: "#1ed760",
        text: "#FFFFFF",
        textMuted: "#b3b3b3",
      },
      fontFamily: {
        sans: [
          "Inter",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "Helvetica Neue",
          "Arial",
          "sans-serif",
        ],
      },
      boxShadow: {
        card: "0 4px 12px rgba(0, 0, 0, 0.4)",
      },
    },
  },
  plugins: [],
};

export default config;