/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
        brand: ["Fraunces", "Georgia", "serif"],
        mono: ["IBM Plex Mono", "ui-monospace", "monospace"],
      },
      colors: {
        // Identidad de marca AlzoLab: navy estructural + naranja de acción.
        navy: {
          DEFAULT: "#0F2740",
          700: "#15324f",
          800: "#0c2036",
          900: "#0a1b2e",
          950: "#081521",
        },
        orange: {
          DEFAULT: "#EF7E32",
          dark: "#e06d22",
          soft: "#fbe9d8",
        },
        // Fondo "papel" cálido (aire editorial, no gris SaaS).
        paper: {
          DEFAULT: "#F7F5F0",
          100: "#efece4",
        },
        line: "#e3ddd1",
        ink: "#1f2a37",
      },
      boxShadow: {
        cta: "0 8px 16px -7px rgba(239,126,50,0.75)",
        card: "0 10px 30px -22px rgba(15,39,64,0.6)",
      },
    },
  },
  plugins: [],
};
