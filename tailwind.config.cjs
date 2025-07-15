// tailwind.config.js
module.exports = {
  content: ["./index.html", "./src/**/*.{vue,js,ts,jsx,tsx}"],
  important: "#app",
  theme: {
    extend: {
      colors: {
        /* direct semantic colors */
        primary: "var(--primary)",
        secondary: "var(--secondary)",
        success: "var(--success)",
        info: "var(--info)",
        warning: "var(--warning)",
        danger: "var(--danger)",
        light: "var(--light)",
        dark: "var(--dark)",

        /* Bootstrap palette via CSS vars */
        blue: "var(--blue)",
        indigo: "var(--indigo)",
        purple: "var(--purple)",
        pink: "var(--pink)",
        red: "var(--red)",
        orange: "var(--orange)",
        yellow: "var(--yellow)",
        green: "var(--green)",
        teal: "var(--teal)",
        cyan: "var(--cyan)",

        /* gray with dark variant */
        gray: "var(--gray)",
        "gray-dark": "var(--gray-dark)",
      },
      fontFamily: {
        sans: ["var(--font-family-sans-serif)"],
        mono: ["var(--font-family-monospace)"],
      },
      screens: {
        xs: "var(--breakpoint-xs)",
        sm: "var(--breakpoint-sm)",
        md: "var(--breakpoint-md)",
        lg: "var(--breakpoint-lg)",
        xl: "var(--breakpoint-xl)",
      },
    },
  },
  plugins: [],
};
