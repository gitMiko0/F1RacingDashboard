/** @type {import('tailwindcss').Config} */
module.exports = {
  theme: {
    extend: {},
  },
  plugins: [
    require('@tailwindcss/forms'), // Add the necessary plugins if not present
    require('tailwindcss-filters'), // Add this plugin for filter utilities
  ],
};


