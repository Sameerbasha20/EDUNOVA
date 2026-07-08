/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        primary: "#1E3A8A",
        secondary: "#10B981",
        accent: "#F97316",
        highlight: "#FBBF24",
        bg: "#F8FAFC",
        "bg-dark": "#0F172A",
        success: "#22C55E",
        error: "#DC2626",
        "text-primary": "#111827",
        "text-secondary": "#6B7280",
        academic: {
          blue: "#1E3A8A",
          green: "#10B981",
          orange: "#F97316",
          gold: "#FBBF24",
        },
        surface: {
          light: "#F8FAFC",
          dark: "#0F172A",
        },
        danger: "#DC2626",
        ink: {
          primary: "#111827",
          secondary: "#6B7280",
        },
      },
      fontFamily: {
        heading: ["Poppins", "sans-serif"],
        subheading: ["Nunito", "sans-serif"],
        sub: ["Nunito", "sans-serif"],
        body: ["Inter", "sans-serif"],
        numbers: ["Montserrat", "sans-serif"],
        numeric: ["Montserrat", "sans-serif"],
      },
      boxShadow: {
        card: "0 1px 3px rgba(17, 24, 39, 0.06), 0 1px 2px rgba(17, 24, 39, 0.04)",
        raised: "0 8px 24px rgba(30, 58, 138, 0.12)",
      },
      borderRadius: {
        card: "16px",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: 0, transform: "translateY(8px)" },
          "100%": { opacity: 1, transform: "translateY(0)" },
        },
        floatSlow: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-14px)" },
        },
      },
      animation: {
        fadeIn: "fadeIn .2s ease",
        floatSlow: "floatSlow 6s ease-in-out infinite",
      },
    },
  },
  plugins: [],
}
