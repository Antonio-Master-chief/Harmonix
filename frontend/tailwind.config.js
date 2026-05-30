/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        void:    '#030309',
        deep:    '#07060F',
        surface: '#0E0C1C',
        card:    '#181629',
        border:  '#2D2B4E',
        muted:   '#9898B8',
        violet: {
          DEFAULT: '#8B5CF6',
          light:   '#A78BFA',
          dark:    '#5B21B6',
          glow:    'rgba(139,92,246,0.25)',
          faint:   'rgba(139,92,246,0.08)',
        },
        neon: {
          cyan:  '#06B6D4',
          pink:  '#F472B6',
          green: '#34D399',
          amber: '#F59E0B',
        },
      },
      fontFamily: {
        display: ['"Syne"', 'sans-serif'],
        mono:    ['"Space Mono"', 'monospace'],
        body:    ['"Inter"', 'sans-serif'],
      },
      animation: {
        'pulse-slow':  'pulse 3s cubic-bezier(0.4,0,0.6,1) infinite',
        'spin-slow':   'spin 8s linear infinite',
        'float':       'float 6s ease-in-out infinite',
        'glow-violet': 'glowViolet 2.5s ease-in-out infinite',
        'glow-cyan':   'glowCyan 3s ease-in-out infinite',
        'fade-up':     'fadeUp 0.5s ease forwards',
        'glitch':      'glitch 6s ease-in-out infinite',
        'gradient-x':  'gradientX 8s ease infinite',
        'ring-expand': 'ringExpand 2.5s ease-out infinite',
        'sonar':       'sonar 2.2s ease-out infinite',
      },
      keyframes: {
        float: {
          '0%,100%': { transform: 'translateY(0px)' },
          '50%':     { transform: 'translateY(-12px)' },
        },
        glowViolet: {
          '0%,100%': { boxShadow: '0 0 20px rgba(139,92,246,0.3)' },
          '50%':     { boxShadow: '0 0 60px rgba(139,92,246,0.7), 0 0 100px rgba(139,92,246,0.15)' },
        },
        glowCyan: {
          '0%,100%': { boxShadow: '0 0 16px rgba(6,182,212,0.25)' },
          '50%':     { boxShadow: '0 0 48px rgba(6,182,212,0.6)' },
        },
        fadeUp: {
          '0%':   { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        glitch: {
          '0%,88%,100%': { clipPath: 'inset(0 0 0 0)', transform: 'translate(0)' },
          '90%': { clipPath: 'inset(15% 0 40% 0)', transform: 'translate(-3px, 2px)' },
          '92%': { clipPath: 'inset(55% 0 15% 0)', transform: 'translate(3px, -1px)' },
          '94%': { clipPath: 'inset(30% 0 55% 0)', transform: 'translate(-2px, 1px)' },
          '96%': { clipPath: 'inset(0 0 0 0)', transform: 'translate(0)' },
        },
        gradientX: {
          '0%,100%': { backgroundPosition: '0% 50%' },
          '50%':     { backgroundPosition: '100% 50%' },
        },
        ringExpand: {
          '0%':   { transform: 'scale(1)',   opacity: '0.7' },
          '100%': { transform: 'scale(2.8)', opacity: '0' },
        },
        sonar: {
          '0%':   { transform: 'scale(1)',   opacity: '0.8' },
          '100%': { transform: 'scale(3.5)', opacity: '0' },
        },
      },
      backgroundSize: {
        '300%': '300%',
        '200%': '200%',
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
}
