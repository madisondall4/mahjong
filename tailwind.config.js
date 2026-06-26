/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: '#F4EEE2',
        paper: '#FBF7EF',
        matcha: '#5F7D4F',
        'matcha-deep': '#3C5236',
        rose: '#C95E83',
        blush: '#F3DEE4',
        sage: '#9DB58E',
        sky: '#5E92B3',
        ink: '#33302A',
        'tile-face': '#ffffff',
        'tile-shadow': '#E6DECE',
      },
      fontFamily: {
        display: ['Playfair Display', 'serif'],
        ui: ['Nunito', 'sans-serif'],
      },
      animation: {
        'tile-deal': 'tileDeal 0.4s ease-out forwards',
        'tile-draw': 'tileDraw 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
        'win-burst': 'winBurst 0.6s ease-out forwards',
        'shimmer': 'shimmer 1.5s ease-in-out infinite',
        'pulse-glow': 'pulseGlow 1.5s ease-in-out infinite',
        'flip-in': 'flipIn 0.4s ease-out forwards',
      },
      keyframes: {
        tileDeal: {
          '0%': { transform: 'translateY(-100vh) rotate(-10deg)', opacity: '0' },
          '100%': { transform: 'translateY(0) rotate(0deg)', opacity: '1' },
        },
        tileDraw: {
          '0%': { transform: 'translateX(-60px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        winBurst: {
          '0%': { transform: 'scale(1)', opacity: '1' },
          '50%': { transform: 'scale(1.1)', opacity: '1' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% center' },
          '100%': { backgroundPosition: '200% center' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 5px rgba(94,140,62,0.3)' },
          '50%': { boxShadow: '0 0 20px rgba(94,140,62,0.8)' },
        },
        flipIn: {
          '0%': { transform: 'rotateY(-90deg)', opacity: '0' },
          '100%': { transform: 'rotateY(0deg)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
