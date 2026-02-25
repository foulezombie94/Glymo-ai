/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        primary: "#101828", // Nutrition Dashboard primary
        "primary-scan": "#7C3AED", // Scanner primary
        "primary-results": "#6366f1", // Results primary
        "background-light": "#F9FAFB",
        "background-dark": "#0F172A",
        "chart-blue": "#8B93FF",
        "chart-orange": "#FFAD84",
        "chart-green": "#7EE0B3",
        "chart-pink": "#FF8F9C",
        "chart-yellow": "#FFE17B",
        "card-light": "#ffffff",
        "card-dark": "#1e293b",
      },
      fontFamily: {
        display: ["Plus Jakarta Sans", "sans-serif"],
        inter: ["Inter", "sans-serif"],
      },
      borderRadius: {
        DEFAULT: "24px",
        xl: "32px",
      },
    },
  },
  plugins: [],
};
