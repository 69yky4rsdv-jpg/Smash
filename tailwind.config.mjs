/** @type {import('tailwindcss').Config} */
const config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      keyframes: {
        "title-scroll": {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" }
        },
        "title-fade-in": {
          "0%": { opacity: "0", transform: "translateY(6px)" },
          "100%": { opacity: "1", transform: "translateY(0)" }
        },
        "title-bounce": {
          "0%, 100%": { transform: "translateY(0)" },
          "30%": { transform: "translateY(-6px)" },
          "50%": { transform: "translateY(0)" },
          "65%": { transform: "translateY(-3px)" },
          "80%": { transform: "translateY(0)" }
        }
      },
      animation: {
        "title-scroll": "title-scroll 12s linear infinite",
        "title-fade-in": "title-fade-in 0.4s ease-out forwards",
        "title-bounce": "title-bounce 0.5s ease-out"
      },
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

