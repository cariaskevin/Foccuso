import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Velqor Society brand palette – dark & exclusive
        base: {
          DEFAULT: "#0a0a0f",
          900: "#0a0a0f",
          800: "#101018",
          700: "#171722",
          600: "#20202e",
        },
        gold: {
          DEFAULT: "#d4af37",
          soft: "#e8cd7a",
          deep: "#b8942a",
        },
        neon: {
          DEFAULT: "#7c5cff",
          soft: "#a78bff",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        card: "0 8px 30px rgba(0,0,0,0.5)",
        glow: "0 0 40px rgba(212,175,55,0.15)",
      },
      backgroundImage: {
        "gold-gradient": "linear-gradient(135deg, #e8cd7a 0%, #d4af37 50%, #b8942a 100%)",
      },
    },
  },
  plugins: [],
};

export default config;
