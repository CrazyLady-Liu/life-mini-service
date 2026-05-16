/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f4ff',
          100: '#e0e9ff',
          200: '#c7d6fe',
          300: '#a4b9fc',
          400: '#7b91f8',
          500: '#5b6bf2',
          600: '#4749e6',
          700: '#3a37cb',
          800: '#3231a3',
          900: '#2e2e81',
          950: '#1c1b4a',
        },
        sleep: {
          dark: '#1a1a2e',
          deep: '#16213e',
          medium: '#0f3460',
          light: '#533483',
          accent: '#e94560',
        }
      }
    },
  },
  plugins: [],
}
