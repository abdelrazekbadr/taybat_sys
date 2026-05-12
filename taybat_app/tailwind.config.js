/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        app: {
          primary: '#10B981',
          secondary: '#06B6D4',
          navy: '#1e293b',
          background: '#f1f5f9',
          surface: '#ffffff',
          text: '#1e293b',
          muted: '#475569',
          card: '#EEF4FF',
        },
      },
      fontFamily: {
        sans: ['Cairo_400Regular'],
        cairo: ['Cairo_400Regular'],
        'cairo-semibold': ['Cairo_600SemiBold'],
        'cairo-bold': ['Cairo_700Bold'],
      },
    },
  },
  plugins: [],
};
