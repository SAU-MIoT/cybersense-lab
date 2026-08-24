/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        navy: { DEFAULT: '#0a1628', mid: '#0f2040', light: '#1a3358' },
        cyan: { DEFAULT: '#00c8e8', dim: '#0097b2' },
      },
      fontFamily: { sans: ['Inter', 'system-ui', 'sans-serif'] },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'pulse-glow': 'pulseGlow 2.2s ease-in-out infinite',
        'spin-slow': 'spin 8s linear infinite',
        'fade-in': 'fadeIn 0.6s ease-out',
        'slide-up': 'slideUp 0.6s ease-out',
        'blink': 'blink 1.5s ease-in-out infinite',
      },
      keyframes: {
        float: { '0%,100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-10px)' } },
        pulseGlow: {
          '0%,100%': { filter: 'drop-shadow(0 0 10px rgba(0,200,232,.4)) brightness(1)' },
          '50%': { filter: 'drop-shadow(0 0 42px rgba(0,200,232,1)) brightness(1.3)' },
        },
        fadeIn: { from: { opacity: '0', transform: 'translateY(20px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        slideUp: { from: { opacity: '0', transform: 'translateY(30px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        blink: { '0%,100%': { opacity: '1', transform: 'scale(1)' }, '50%': { opacity: '0.2', transform: 'scale(0.7)' } },
      },
    },
  },
  plugins: [],
};
