import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        burgundy: {
          50: "#fdf2f4",
          100: "#fce7eb",
          200: "#f9d0d9",
          300: "#f4a9b9",
          400: "#ed7893",
          500: "#e14d6f",
          600: "#cc2d55",
          700: "#ab2045",
          800: "#8b1d3b",
          900: "#6b1a32",
          950: "#3d0a1a",
          DEFAULT: "#7A1B2D",
        },
        gold: {
          50: "#fefbea",
          100: "#fdf5c7",
          200: "#fcea8a",
          300: "#fad94d",
          400: "#f7c625",
          500: "#e8ac0d",
          600: "#c98508",
          700: "#a15f0a",
          800: "#854b10",
          900: "#713e13",
          DEFAULT: "#C8A951",
        },
        cream: "#FFF8F0",
        "dark-red": "#4A0E1C",
      },
      fontFamily: {
        serif: ['"Helvetica Neue"', "Helvetica", "Arial", "sans-serif"],
        sans: ['"Helvetica Neue"', "Helvetica", "Arial", "sans-serif"],
        display: ['"Helvetica Neue"', "Helvetica", "Arial", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
