/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        linen: "#F4F2ED",
        ink: "#14281D",
        brand: "#2E5C55",
        moss: "#D6E0D2"
      },
      fontFamily: {
        serif: [
          '"Aspekta"',
          "system-ui",
          "-apple-system",
          '"Segoe UI"',
          "Roboto",
          "Helvetica",
          "Arial",
          "sans-serif"
        ],
        sans: [
          '"Aspekta"',
          "system-ui",
          "-apple-system",
          '"Segoe UI"',
          "Roboto",
          "Helvetica",
          "Arial",
          "sans-serif"
        ]
      },
      fontSize: {
        display: ["var(--fs-display)", { lineHeight: "var(--lh-tight)" }],
        h1: ["var(--fs-h1)", { lineHeight: "var(--lh-tight)" }],
        h2: ["var(--fs-h2)", { lineHeight: "var(--lh-title)" }],
        h3: ["var(--fs-h3)", { lineHeight: "var(--lh-title)" }],
        body: ["var(--fs-body)", { lineHeight: "var(--lh-body)" }],
        ui: ["var(--fs-ui)", { lineHeight: "var(--lh-ui)" }],
        small: ["var(--fs-small)", { lineHeight: "1.4" }]
      },
      fontWeight: {
        body: "450",
        strong: "600",
        label: "600",
        heading: "700",
        display: "800"
      }
    }
  },
  plugins: []
};
