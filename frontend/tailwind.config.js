/** Tailwind CSS configuration (JS) */
module.exports = {
  content: ['./index.html', './src/**/*.{vue,ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui'],
      },
      colors: {
        accent: {
          50: '#e7f1ff',
          100: '#d1e0ff',
          200: '#a9d0ff',
          300: '#7ab4ff',
          400: '#4f93ff',
          500: '#2b6fff', // primary accent shade
          600: '#2454cc',
          700: '#1b3d99',
          800: '#122a66',
          900: '#0a1a33',
        },
      },
    },
  },
  plugins: [],
}
