/** @type {import('tailwindcss').Config} */
const config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        background: "#050509",
        foreground: "#f9fafb",
        accent: {
          pink: "#ff2e9f",
          pinkSoft: "#ff7ac4"
        }
      },
      fontFamily: {
        sans: ["system-ui", "ui-sans-serif", "sans-serif"]
      },
      backgroundImage: {
        "gradient-pink": "linear-gradient(135deg, #ff2e9f, #ff7ac4)",
        "gradient-pink-soft": "linear-gradient(135deg, #ff7ac4, #ffe0f2)"
      }
    }
  },
  plugins: []
};

export default config;

