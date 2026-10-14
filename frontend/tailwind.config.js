/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cs2: {
          bg: "#090d16",
          card: "#111827",
          cardHover: "#182235",
          border: "#1f293d",
          gold: "#eab308",
          goldHover: "#facc15",
          ct: "#38bdf8",
          ctDark: "#0369a1",
          t: "#f97316",
          tDark: "#c2410c",
          smoke: "#94a3b8",
          flash: "#fef08a",
          molo: "#ef4444",
          he: "#fb923c"
        }
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Fira Code', 'Courier New', 'monospace'],
      }
    },
  },
  plugins: [],
}
