const config = {
  content: [
    "./src/**/*.{html,js,svelte,ts}",
    "./node_modules/flowbite-svelte/**/*.{html,js,svelte,ts}",
  ],

  plugins: [require("flowbite/plugin")],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#F5F8FF",
          100: "#EBF2FF",
          200: "#C6D7FF",
          300: "#A1BCFF",
          400: "#4D89FF",
          500: "#0057FF",
          600: "#004FE6",
          700: "#003FBD",
          800: "#0032A0",
          900: "#002887",
        },
        secondary: {
          50: "#F5F8FF",
          100: "#EBF2FF",
          200: "#C6D7FF",
          300: "#A1BCFF",
          400: "#4D89FF",
          500: "#0057FF",
          600: "#004FE6",
          700: "#003FBD",
          800: "#0032A0",
          900: "#002887",
        },
      },
    },
  },
};

module.exports = config;
