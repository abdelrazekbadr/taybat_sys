/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        app: {
          primary: '#10B981',
          primaryDark: '#059669',
          secondary: '#06B6D4',
          navy: '#1e293b',
          background: '#f1f5f9',
          surface: '#ffffff',
          surfaceAlt: '#f8fafc',
          text: '#1e293b',
          muted: '#475569',
          textSoft: '#64748B',
          muted2: '#94A3B8',
          card: '#EEF4FF',
          line: '#E5EBF1',
          lineSoft: '#EEF2F6',
          successSoft: '#DCFCE7',
          warning: '#F5A623',
          warningSoft: '#FFF4D6',
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
