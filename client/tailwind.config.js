/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'brand-primary': '#98CD00',
        'brand-secondary': '#A4DD00',
        'brand-accent-1': '#FFFADC',
        'brand-accent-2': '#B6F500',
        'brand-gold': '#E6D89A'
      },
      borderRadius: {
        lg: '0.5rem'
      },
      boxShadow: {
        soft: '0 6px 18px rgba(0,0,0,0.06)',
        soft2: '0 8px 30px rgba(0,0,0,0.08)'
      },
      transitionDuration: {
        300: '300ms'
      }
    },
  },
  plugins: [],
}