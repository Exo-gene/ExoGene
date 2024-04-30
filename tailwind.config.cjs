const config = {
  content: [
    "./src/**/*.{html,js,svelte,ts}",
    "./node_modules/flowbite-svelte/**/*.{html,js,svelte,ts}",
  ],

  plugins: [require("flowbite/plugin")],
  darkMode: "selector",
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#FFF5F2",
          100: "#FFF1EE",
          200: "#FFE4DE",
          300: "#FFD5CC",
          400: "#FFBCAD",
          500: "#FE795D",
          600: "#EF562F",
          700: "#EB4F27",
          800: "#CC4522",
          900: "#A5371B",
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
