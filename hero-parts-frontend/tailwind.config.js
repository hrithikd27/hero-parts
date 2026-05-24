/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        hero: {
          red: '#D72128',
          bg: '#F4F6F8',
          card: '#FFFFFF',
          border: '#E2E8F0',
          accent: '#D72128',
          subtle: '#F8FAFC',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 3px 0 rgb(0 0 0 / 0.07), 0 1px 2px -1px rgb(0 0 0 / 0.07)',
        'card-hover': '0 4px 6px -1px rgb(0 0 0 / 0.08), 0 2px 4px -2px rgb(0 0 0 / 0.08)',
      },
      keyframes: {
        progress: { '0%': { width: '0%' }, '100%': { width: '100%' } },
        micbar: { '0%': { transform: 'scaleY(0.3)' }, '100%': { transform: 'scaleY(1)' } },
        fadeIn: { '0%': { opacity: '0', transform: 'translateY(8px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
        cartbump: {
          '0%':   { transform: 'scale(1) rotate(0deg)' },
          '20%':  { transform: 'scale(1.4) rotate(-14deg)' },
          '50%':  { transform: 'scale(1.18) rotate(7deg)' },
          '75%':  { transform: 'scale(1.05) rotate(-3deg)' },
          '100%': { transform: 'scale(1) rotate(0deg)' },
        },
      },
      animation: {
        progress: 'progress 2s linear forwards',
        fadeIn: 'fadeIn 0.2s ease-out',
        cartbump: 'cartbump 0.5s ease-out',
      },
    },
  },
  plugins: [],
}
