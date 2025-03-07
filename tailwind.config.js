/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],

  daisyui: {
    themes: [
      {
        mytheme: {
          primary: "#4db2c1",

          secondary: "#e08b7f",

          accent: "#ecfc92",

          neutral: "#1a1c23",

          "base-100": "#1a1c23",

          info: "#87bce8",

          success: "#39d0ba",

          warning: "#ecac4b",

          error: "#f13a37",
        },
      },
    ],
  },
  plugins: [require("daisyui")],
};
