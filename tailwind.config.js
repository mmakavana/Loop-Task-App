/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Sage / Opal palette
        primary: "#AAC4B8",       // opal / sage
        primaryDeep: "#7FA898",   // darker sage for banner/active
        primaryMuted: "#D9E6E0",  // pale sage accents

        // Neutrals
        surface: "#F3F7F5",       // app background
        card: "#FFFFFF",          // cards
        ink: "#1F2A2E",           // default text
        muted: "#5E6B70",         // secondary text
        line: "#E7ECEA",          // dividers/borders

        // Alerts
        danger: "#D14D4D",
      },
      boxShadow: {
        soft: "0 8px 24px rgba(31,42,46,0.06)",
      },
      borderRadius: {
        xl2: "1rem",
      },
    },
  },
  plugins: [],
}
