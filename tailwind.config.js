/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx,js,jsx}'],
  theme: {
    extend: {
      colors: {
        loopGreen: '#9CAF88'
      },
      boxShadow: {
        soft: '0 8px 30px rgba(0,0,0,0.06)'
      }
    },
  },
  plugins: [],
}