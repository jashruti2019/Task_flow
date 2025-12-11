/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        accentFrom: 'var(--accent-from)',
        accentTo: 'var(--accent-to)',
      },
    },
  },
  plugins: [],
};
