module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#033455',
          50: '#e6eef4',
          100: '#c0d5e5',
          200: '#96b9d3',
          300: '#6b9dc1',
          400: '#4d87b4',
          500: '#2e71a6',
          600: '#1e5f94',
          700: '#0d4d82',
          800: '#033455',
          900: '#022440',
        },
        secondary: '#4C4C4C',
        accent: '#c9a84c',
      },
      fontFamily: {
        sans: ['Nunito', 'system-ui', 'sans-serif'],
        display: ['"Playfair Display"', 'Georgia', 'serif'],
        arabic: ['"Amiri"', 'serif'],
      },
      boxShadow: {
        card: '0 2px 16px rgba(3,52,85,0.08)',
        'card-hover': '0 8px 32px rgba(3,52,85,0.16)',
      }
    },
  },
  plugins: [],
};
