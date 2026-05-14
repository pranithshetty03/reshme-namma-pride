/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        "reshme-green": "#2E7D4F",
        "reshme-amber": "#D4820A",
        "reshme-red": "#C0392B",
        "reshme-gold": "#C9A84C",
        "reshme-silk": "#FDF6E3",
        "reshme-dark": "#1A1A2E",
      },
      fontFamily: {
        serif: ["Georgia", "Cambria", "'Times New Roman'", "serif"],
      },
    },
  },
  plugins: [],
};
