/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        gold: {
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
          neon: '#FFD700',
          glow: '#FFA500',
          bright: '#FFED4A',
        },
        dark: {
          900: '#000000',
          800: '#050505',
          700: '#0a0a0a',
          600: '#0f0f0f',
          500: '#141414',
          400: '#1a1a1a',
          300: '#1f1f1f',
          200: '#252525',
          100: '#2a2a2a',
        },
        neon: {
          green: '#00ff41',
          red: '#ff0040',
          blue: '#00d4ff',
          purple: '#bf00ff',
          yellow: '#ffff00',
        }
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Fira Code', 'Courier New', 'monospace'],
        display: ['Orbitron', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
      },
      animation: {
        'spin-slow': 'spin 8s linear infinite',
        'spin-reverse': 'spin-reverse 6s linear infinite',
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        'glitch': 'glitch 0.3s ease-in-out infinite',
        'float': 'float 6s ease-in-out infinite',
        'scanline': 'scanline 8s linear infinite',
        'flicker': 'flicker 0.15s infinite',
        'bounce-slow': 'bounce 3s infinite',
        'fade-in-up': 'fadeInUp 0.6s ease-out',
        'slide-in-left': 'slideInLeft 0.6s ease-out',
        'slide-in-right': 'slideInRight 0.6s ease-out',
        'typing': 'typing 3.5s steps(40, end)',
        'blink': 'blink 1s step-end infinite',
        'particle-float': 'particleFloat 10s ease-in-out infinite',
        'ring-rotate': 'ringRotate 4s linear infinite',
        'neon-flicker': 'neonFlicker 1.5s ease-in-out infinite',
        'shake': 'shake 0.5s cubic-bezier(.36,.07,.19,.97) both',
        'zoom-in': 'zoomIn 0.4s ease-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'radar': 'radar 2s linear infinite',
        'expand': 'expand 0.3s ease-out',
      },
      keyframes: {
        'spin-reverse': {
          from: { transform: 'rotate(360deg)' },
          to: { transform: 'rotate(0deg)' },
        },
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 20px #FFD700, 0 0 40px #FFD700, 0 0 60px #FFD700' },
          '50%': { boxShadow: '0 0 40px #FFD700, 0 0 80px #FFD700, 0 0 120px #FFD700' },
        },
        'glitch': {
          '0%': { transform: 'translate(0)', clipPath: 'inset(0 0 0 0)' },
          '20%': { transform: 'translate(-2px, 2px)', clipPath: 'inset(33% 0 66% 0)' },
          '40%': { transform: 'translate(2px, -2px)', clipPath: 'inset(66% 0 33% 0)' },
          '60%': { transform: 'translate(-2px, 2px)', clipPath: 'inset(10% 0 85% 0)' },
          '80%': { transform: 'translate(2px, -2px)', clipPath: 'inset(80% 0 5% 0)' },
          '100%': { transform: 'translate(0)', clipPath: 'inset(0 0 0 0)' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        'scanline': {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100vh)' },
        },
        'flicker': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.8' },
        },
        'fadeInUp': {
          from: { opacity: '0', transform: 'translateY(30px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'slideInLeft': {
          from: { opacity: '0', transform: 'translateX(-50px)' },
          to: { opacity: '1', transform: 'translateX(0)' },
        },
        'slideInRight': {
          from: { opacity: '0', transform: 'translateX(50px)' },
          to: { opacity: '1', transform: 'translateX(0)' },
        },
        'typing': {
          from: { width: '0' },
          to: { width: '100%' },
        },
        'blink': {
          '0%, 100%': { borderColor: 'transparent' },
          '50%': { borderColor: '#FFD700' },
        },
        'particleFloat': {
          '0%': { transform: 'translateY(100vh) rotate(0deg)', opacity: '0' },
          '10%': { opacity: '1' },
          '90%': { opacity: '1' },
          '100%': { transform: 'translateY(-100px) rotate(720deg)', opacity: '0' },
        },
        'ringRotate': {
          from: { transform: 'rotate(0deg)' },
          to: { transform: 'rotate(360deg)' },
        },
        'neonFlicker': {
          '0%, 19%, 21%, 23%, 25%, 54%, 56%, 100%': {
            textShadow: '0 0 4px #FFD700, 0 0 11px #FFD700, 0 0 19px #FFD700, 0 0 40px #FFD700',
          },
          '20%, 24%, 55%': { textShadow: 'none' },
        },
        'shake': {
          '10%, 90%': { transform: 'translate3d(-1px, 0, 0)' },
          '20%, 80%': { transform: 'translate3d(2px, 0, 0)' },
          '30%, 50%, 70%': { transform: 'translate3d(-4px, 0, 0)' },
          '40%, 60%': { transform: 'translate3d(4px, 0, 0)' },
        },
        'zoomIn': {
          from: { opacity: '0', transform: 'scale(0.8)' },
          to: { opacity: '1', transform: 'scale(1)' },
        },
        'slideUp': {
          from: { opacity: '0', transform: 'translateY(20px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'radar': {
          from: { transform: 'rotate(0deg)' },
          to: { transform: 'rotate(360deg)' },
        },
        'expand': {
          from: { transform: 'scale(0)', opacity: '0' },
          to: { transform: 'scale(1)', opacity: '1' },
        },
      },
      backgroundImage: {
        'gold-gradient': 'linear-gradient(135deg, #FFD700, #FFA500, #FF6B00)',
        'dark-gradient': 'linear-gradient(135deg, #000000, #0a0a0a, #141414)',
        'glass': 'linear-gradient(135deg, rgba(255, 215, 0, 0.05), rgba(255, 165, 0, 0.02))',
      },
      backdropBlur: {
        xs: '2px',
      },
      boxShadow: {
        'gold': '0 0 20px rgba(255, 215, 0, 0.5)',
        'gold-lg': '0 0 40px rgba(255, 215, 0, 0.6), 0 0 80px rgba(255, 165, 0, 0.3)',
        'gold-xl': '0 0 60px rgba(255, 215, 0, 0.8), 0 0 120px rgba(255, 165, 0, 0.5)',
        'glass': '0 8px 32px rgba(0, 0, 0, 0.8)',
        'neon-red': '0 0 20px rgba(255, 0, 64, 0.6)',
        'neon-green': '0 0 20px rgba(0, 255, 65, 0.6)',
        'inner-gold': 'inset 0 0 30px rgba(255, 215, 0, 0.1)',
      },
      screens: {
        'xs': '375px',
      },
    },
  },
  plugins: [],
}
