// tailwind.config.js
// import lineClamp from "@tailwindcss/line-clamp";

/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        eco: {
          green: "#2d6a4f",
          blue: "#1d4d6e",
          light: "#f8f9fa",
          accent: "#95d5b2",
          dark: "#1a3d2e",
          darkest: "#01352c",
        },
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
      },
    },
  },
  plugins: [
    // lineClamp
  ],
};
