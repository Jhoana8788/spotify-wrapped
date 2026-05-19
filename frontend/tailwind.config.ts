import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // SOLO colores propios que no existen en Tailwind por defecto.
        // No tocamos rose, amber, violet, pink, orange, cyan, emerald, indigo
        // para conservar sus escalas completas (rose-500, amber-300, etc.).
        bg: "#0a0a0f",
        panel: "#14141a",
        panelAlt: "#1c1c24",
        panelHover: "#22222d",
        border: "#2a2a35",
        borderLight: "#35354a",
        text: "#FFFFFF",
        textMuted: "#9ca3af",
        textDim: "#6b7280",
        accent: "#1DB954",
        accentHover: "#1ed760",
        accentDim: "rgba(29, 185, 84, 0.15)",
      },
      fontFamily: {
        sans: ["Inter","-apple-system","BlinkMacSystemFont","Segoe UI","Roboto","sans-serif"],
      },
      boxShadow: {
        card: "0 4px 12px rgba(0, 0, 0, 0.4)",
        glow: "0 0 24px rgba(29, 185, 84, 0.25)",
        kpi: "0 8px 24px rgba(0, 0, 0, 0.5)",
      },
      backgroundImage: {
        "kpi-green": "linear-gradient(135deg, #10b981 0%, #1DB954 100%)",
        "kpi-pink": "linear-gradient(135deg, #ec4899 0%, #f43f5e 100%)",
        "kpi-violet": "linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)",
        "kpi-orange": "linear-gradient(135deg, #f97316 0%, #f59e0b 100%)",
        "kpi-cyan": "linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)",
      },
      animation: {
        "fade-in": "fadeIn 0.3s ease-in",
        "slide-up": "slideUp 0.4s ease-out",
        "pulse-glow": "pulseGlow 2s ease-in-out infinite",
      },
      keyframes: {
        fadeIn: { "0%": { opacity: "0" }, "100%": { opacity: "1" } },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        pulseGlow: {
          "0%, 100%": { boxShadow: "0 0 0 0 rgba(29, 185, 84, 0.4)" },
          "50%": { boxShadow: "0 0 0 12px rgba(29, 185, 84, 0)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;