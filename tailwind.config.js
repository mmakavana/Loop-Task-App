/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Opal / sage palette
        primary: "#AAC4B8",       // Opal
        primaryDeep: "#7FA898",   // Darker sage
        primaryMuted: "#D9E6E0",  // Pale sage
        // Neutrals
        surface: "#F3F7F5",       // App background
        card: "#FFFFFF",
        ink: "#1F2A2E",
        muted: "#68757A",
        line: "#E7ECEA",
        // Accents
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
