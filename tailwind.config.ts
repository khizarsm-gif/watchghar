import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Watch Ghar: dark and gold. Whole app is dark, so the neutral "gray"
        // scale is inverted (gray-900 = near-white text, gray-50 = darkest panel)
        // and the old light "brand" tints are dark gold tints.
        brand: {
          50: "#1e1810",
          100: "#2a2013",
          200: "#5a4520",
          300: "#e6d49a",
          400: "#d9bc62",
          500: "#c9a43f",
          600: "#d4af37",
          700: "#e4c564",
          800: "#efd98f",
          900: "#f6e8b8",
          950: "#0c0906",
        },
        accent: {
          50: "#0f1a2b",
          100: "#14233a",
          200: "#1f3a63",
          300: "#8fbaff",
          400: "#6aa3ff",
          500: "#4a8bf5",
          600: "#3b7be0",
          700: "#8fbaff",
          800: "#a9cbff",
          900: "#c6dcff",
        },
        gray: {
          50: "#15110d",
          100: "#1c1711",
          200: "#2e2619",
          300: "#40362a",
          400: "#8b806d",
          500: "#a89d89",
          600: "#c2b8a4",
          700: "#d8cfbc",
          800: "#ebe4d3",
          900: "#f7f2e7",
          950: "#fbf8f1",
        },
        amber: {
          50: "#2a1f0a",
          100: "#3a2a0c",
          200: "#5c4210",
          700: "#f0c25c",
          800: "#f6d58a",
        },
        red: {
          50: "#2b1111",
          100: "#3a1616",
          200: "#5c2020",
          700: "#fca5a5",
          800: "#fecaca",
        },
        surface: "rgb(23 19 16 / <alpha-value>)",
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
        card: "0 2px 10px 0 rgba(16, 24, 40, 0.06)",
        "card-hover": "0 8px 24px 0 rgba(16, 24, 40, 0.10)",
      },
      borderRadius: {
        xl2: "1.25rem",
      },
    },
  },
  plugins: [],
};

export default config;
