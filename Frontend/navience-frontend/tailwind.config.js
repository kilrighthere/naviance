/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#0024c1",
        "primary-container": "#0033ff",
        secondary: "#545a91",
        tertiary: "#4421a7",
        surface: "#f9f9ff",
        "surface-container-low": "#f0f3ff",
        "surface-container-high": "#e2e8f8",
        "outline-variant": "#c4c5da",
        "on-surface": "#151c27",
        "on-surface-variant": "#444657",
        "primary-fixed-dim": "#bcc3ff",
        "inverse-surface": "#2a313c",
      },
      fontFamily: {
        "display-lg": ["Hanken Grotesk", "sans-serif"],
        "headline-md": ["Hanken Grotesk", "sans-serif"],
        "body-lg": ["Inter", "sans-serif"],
        "body-md": ["Inter", "sans-serif"],
        "body-sm": ["Inter", "sans-serif"],
        "label-md": ["JetBrains Mono", "monospace"],
        "label-sm": ["JetBrains Mono", "monospace"],
      },
      fontSize: {
        "display-lg": ["48px", { lineHeight: "1.1" }],
        "headline-md": ["20px", { lineHeight: "28px" }],
        "body-lg": ["18px", { lineHeight: "28px" }],
        "body-md": ["16px", { lineHeight: "24px" }],
        "body-sm": ["14px", { lineHeight: "20px" }],
        "label-md": ["14px", { lineHeight: "20px" }],
        "label-sm": ["12px", { lineHeight: "16px" }],
      },
      maxWidth: {
        "360": "90rem",
      },
      spacing: {
        "container-padding": "24px",
        "90": "22.5rem",
      },
    },
  },
  plugins: [],
}
