/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      animation: {
        'spin-fast': 'spin 0.8s linear infinite',
      }
    },
  },
  plugins: [
   require('@tailwindcss/line-clamp'),
   require('tailwind-scrollbar-hide')
  ],
}
