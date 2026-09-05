/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        soccer: {
          dark: '#0B0F17',
          card: '#131B2A',
          cardHover: '#1B263B',
          accent: '#00E676',
          accentBlue: '#2979FF',
          accentPurple: '#7C4DFF',
          accentRed: '#FF5252',
          accentYellow: '#FFD600',
          textMuted: '#94A3B8',
          border: '#1E293B'
        }
      }
    },
  },
  plugins: [],
}
