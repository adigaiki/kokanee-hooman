/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './restaurant/**/*.html', './script.js'],
  theme: {
    extend: {
      colors: { ink: '#173c31', paper: '#f7f1e5', coral: '#c95036', lime: '#c3d04e' },
      fontFamily: { display: ['Fraunces', 'Georgia', 'serif'], body: ['DM Sans', 'Arial', 'sans-serif'] },
    },
  },
  plugins: [],
};
