/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        purple: {
          primary:  '#6C63FF',
          light:    '#8B83FF',
          dark:     '#4F46E5',
          deeper:   '#3730A3',
          glow:     'rgba(108,99,255,0.35)',
        },
        bg: {
          black:  '#000000',
          dark:   '#050508',
          card:   '#0a0a10',
          cardHover: '#111118',
          border: '#1c1c2e',
        },
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'sans-serif'],
        body:    ['"Inter"', 'sans-serif'],
      },
      animation: {
        'pulse-slow':   'pulse 3s cubic-bezier(0.4,0,0.6,1) infinite',
        'spin-slow':    'spin 3s linear infinite',
        'float':        'float 6s ease-in-out infinite',
        'sonar':        'sonar 2s ease-out infinite',
        'glow-pulse':   'glowPulse 2.5s ease-in-out infinite',
        'gradient-x':   'gradientX 8s ease infinite',
        'fade-up':      'fadeUp 0.6s ease forwards',
      },
      keyframes: {
        float: {
          '0%,100%': { transform: 'translateY(0px)' },
          '50%':     { transform: 'translateY(-16px)' },
        },
        sonar: {
          '0%':   { transform: 'scale(1)',   opacity: '0.8' },
          '100%': { transform: 'scale(3.5)', opacity: '0' },
        },
        glowPulse: {
          '0%,100%': { boxShadow: '0 0 20px rgba(108,99,255,0.4)' },
          '50%':     { boxShadow: '0 0 60px rgba(108,99,255,0.8), 0 0 100px rgba(108,99,255,0.3)' },
        },
        gradientX: {
          '0%,100%': { backgroundPosition: '0% 50%' },
          '50%':     { backgroundPosition: '100% 50%' },
        },
        fadeUp: {
          '0%':   { opacity: '0', transform: 'translateY(24px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      backgroundSize: {
        '300%': '300%',
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
}
