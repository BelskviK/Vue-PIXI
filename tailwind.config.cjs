module.exports = {
  content: [
    './index.html',
    './src/**/*.{vue,js,ts,jsx,tsx}'
  ],
  important: '#app',
  theme: {
    extend: {
      colors: {
        blue: {
          500: '#3b82f6', // Default Tailwind blue
        }
      }
    },
  },
  plugins: [],
}
