/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#f5f9ff",
          100: "#eaf1ff",
          200: "#d3e1ff",
          300: "#a9c5ff",
          400: "#75a1ff",
          500: "#4b7eff",   // primary
          600: "#335fe0",
          700: "#294bb3",
          800: "#213c8c",
          900: "#1e356f"
        }
      }
    },
  },
  plugins: [],
};
