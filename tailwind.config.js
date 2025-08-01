﻿/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{vue,js,ts,jsx,tsx}"],
  important: "#app",
  theme: {
    screens: {
      xs: "0px",
      sm: "576px",
      md: "768px",
      lg: "992px",
      xl: "1200px",
    },
    extend: {
      colors: {
        /* Semantic colors */
        primary: "#007bff" /* blue */,
        secondary: "#6c757d" /* gray */,
        success: "#28a745" /* green */,
        info: "#17a2b8" /* cyan */,
        warning: "#ffc107" /* yellow */,
        danger: "#dc3545" /* red */,
        light: "#f8f9fa",
        dark: "#343a40" /* gray-dark */,

        /* Bootstrap palette */
        blue: "#007bff",
        indigo: "#6610f2",
        purple: "#6f42c1",
        pink: "#e83e8c",
        red: "#dc3545",
        orange: "#fd7e14",
        yellow: "#ffc107",
        green: "#28a745",
        teal: "#20c997",
        cyan: "#17a2b8",
        gray: "#6c757d",
        "gray-dark": "#343a40",
      },
      fontFamily: {
        sans: ["Roboto", "ui-sans-serif", "system-ui" /* …etc… */],
        mono: [
          "SFMono-Regular",
          "Menlo",
          "Monaco",
          "Consolas",
          "Liberation Mono",
          "Courier New",
          "monospace",
        ],
      },
    },
  },
  plugins: [],
};
