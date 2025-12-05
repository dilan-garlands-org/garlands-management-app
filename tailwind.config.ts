/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f9f4',
          100: '#daf2e4',
          200: '#b8e5cc',
          300: '#88d1ac',
          400: '#56b687',
          500: '#349b6b',
          600: '#267d55',
          700: '#1f6446',
          800: '#1a5038',
          900: '#16422f',
        },
      },
    },
  },
  plugins: [],
}