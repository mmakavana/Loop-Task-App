/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html","./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#AAC4B8",
        primaryMuted: "#C7D7CF",
        primaryDeep: "#7FA898",
        surface: "#F7FAF9",
        ink: "#1F2A2E",
        muted: "#5E6B70",
        card: "#FFFFFF",
        danger: "#C0392B",
        success: "#2E7D32"
      },
      borderRadius: { xl2: "1rem" },
      boxShadow: { soft: "0 10px 24px rgba(31,42,46,0.08)" }
    }
  },
  plugins: []
}