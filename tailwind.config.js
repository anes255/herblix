/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Tajawal", "system-ui", "sans-serif"],
      },
      colors: {
        brand: {
          50: "#ecfdf5",
          100: "#d1fae5",
          200: "#a7f3d0",
          300: "#6ee7b7",
          400: "#34d399",
          500: "#10b981",
          600: "#059669",
          700: "#047857",
          800: "#065f46",
          900: "#064e3b",
        },
        accent: {
          50: "#f0fdfa",
          100: "#ccfbf1",
          400: "#2dd4bf",
          500: "#14b8a6",
          600: "#0d9488",
        },
      },
      boxShadow: {
        soft: "0 10px 40px -12px rgba(0,0,0,0.12)",
        glow: "0 20px 60px -18px rgba(5,150,105,0.45)",
        card: "0 4px 24px -8px rgba(15,23,42,0.10)",
      },
      backgroundImage: {
        "brand-gradient":
          "linear-gradient(135deg, #059669 0%, #0d9488 50%, #10b981 100%)",
        "mesh":
          "radial-gradient(at 15% 15%, rgba(16,185,129,0.14) 0px, transparent 55%), radial-gradient(at 85% 20%, rgba(20,184,166,0.14) 0px, transparent 55%), radial-gradient(at 50% 100%, rgba(5,150,105,0.10) 0px, transparent 55%)",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        pop: {
          "0%": { opacity: "0", transform: "scale(0.9)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        float: {
          "0%,100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-6px)" },
        },
        "pulse-ring": {
          "0%": { transform: "scale(0.9)", opacity: "0.7" },
          "80%,100%": { transform: "scale(1.6)", opacity: "0" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.4s ease-out",
        pop: "pop 0.35s cubic-bezier(0.34,1.56,0.64,1)",
        float: "float 4s ease-in-out infinite",
        "pulse-ring": "pulse-ring 2s ease-out infinite",
      },
    },
  },
  plugins: [],
};
