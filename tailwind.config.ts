import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Watch Ghar: ivory and gold. Every colour is a CSS variable (see globals.css)
        // so the storefront is light, while the admin portal keeps the dark
        // palette by wrapping itself in the "theme-dark" class.
      brand: {
        50: "rgb(var(--brand-50) / <alpha-value>)",
        100: "rgb(var(--brand-100) / <alpha-value>)",
        200: "rgb(var(--brand-200) / <alpha-value>)",
        300: "rgb(var(--brand-300) / <alpha-value>)",
        400: "rgb(var(--brand-400) / <alpha-value>)",
        500: "rgb(var(--brand-500) / <alpha-value>)",
        600: "rgb(var(--brand-600) / <alpha-value>)",
        700: "rgb(var(--brand-700) / <alpha-value>)",
        800: "rgb(var(--brand-800) / <alpha-value>)",
        900: "rgb(var(--brand-900) / <alpha-value>)",
        950: "rgb(var(--brand-950) / <alpha-value>)",
      },
      accent: {
        50: "rgb(var(--accent-50) / <alpha-value>)",
        100: "rgb(var(--accent-100) / <alpha-value>)",
        200: "rgb(var(--accent-200) / <alpha-value>)",
        300: "rgb(var(--accent-300) / <alpha-value>)",
        400: "rgb(var(--accent-400) / <alpha-value>)",
        500: "rgb(var(--accent-500) / <alpha-value>)",
        600: "rgb(var(--accent-600) / <alpha-value>)",
        700: "rgb(var(--accent-700) / <alpha-value>)",
        800: "rgb(var(--accent-800) / <alpha-value>)",
        900: "rgb(var(--accent-900) / <alpha-value>)",
      },
      gray: {
        50: "rgb(var(--gray-50) / <alpha-value>)",
        100: "rgb(var(--gray-100) / <alpha-value>)",
        200: "rgb(var(--gray-200) / <alpha-value>)",
        300: "rgb(var(--gray-300) / <alpha-value>)",
        400: "rgb(var(--gray-400) / <alpha-value>)",
        500: "rgb(var(--gray-500) / <alpha-value>)",
        600: "rgb(var(--gray-600) / <alpha-value>)",
        700: "rgb(var(--gray-700) / <alpha-value>)",
        800: "rgb(var(--gray-800) / <alpha-value>)",
        900: "rgb(var(--gray-900) / <alpha-value>)",
        950: "rgb(var(--gray-950) / <alpha-value>)",
      },
      amber: {
        50: "rgb(var(--amber-50) / <alpha-value>)",
        100: "rgb(var(--amber-100) / <alpha-value>)",
        200: "rgb(var(--amber-200) / <alpha-value>)",
        700: "rgb(var(--amber-700) / <alpha-value>)",
        800: "rgb(var(--amber-800) / <alpha-value>)",
      },
      red: {
        50: "rgb(var(--red-50) / <alpha-value>)",
        100: "rgb(var(--red-100) / <alpha-value>)",
        200: "rgb(var(--red-200) / <alpha-value>)",
        700: "rgb(var(--red-700) / <alpha-value>)",
        800: "rgb(var(--red-800) / <alpha-value>)",
      },
        surface: "rgb(var(--surface) / <alpha-value>)",
        page: "rgb(var(--page) / <alpha-value>)",
        ink: "#14110e",
      },
      fontFamily: {
        display: ['"Cormorant Garamond"', '"Playfair Display"', "Georgia", '"Times New Roman"', "serif"],
        sans: [
          "Inter",
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "sans-serif",
        ],
      },
      boxShadow: {
        card: "0 1px 2px 0 rgba(60, 45, 20, 0.05), 0 4px 16px -4px rgba(60, 45, 20, 0.08)",
        "card-hover": "0 2px 4px 0 rgba(60, 45, 20, 0.06), 0 16px 36px -8px rgba(60, 45, 20, 0.18)",
      },
      borderRadius: {
        xl2: "1.25rem",
      },
    },
  },
  plugins: [],
};

export default config;
