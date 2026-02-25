/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./App.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  // @ts-ignore - Nativewind preset module resolution issue in some IDEs
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: "#101828",
        "primary-scan": "#7C3AED",
        "primary-results": "#6366f1",
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
      borderRadius: {
        DEFAULT: "24px",
        xl: "32px",
      },
    },
  },
  plugins: [],
};
