/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Dark slate colors for premium dark background
        slate: {
          950: '#020617',
          900: '#0F172A',
          800: '#1E293B',
        },
        // Accent colors for premium design
        accent: {
          saffron: '#FF7A18',
          green: '#22C55E',
          blue: '#38BDF8',
        },
        // Legacy colors (preserved for backward compatibility)
        saffron: {
          DEFAULT: '#FF9933',
          light: '#FFB366',
          dark: '#CC7A29',
        },
        green: {
          DEFAULT: '#138808',
          light: '#1AAD0A',
          dark: '#0F6906',
        },
        white: {
          DEFAULT: '#FFFFFF',
          soft: '#F8F9FA',
        },
        glass: {
          light: 'rgba(255, 255, 255, 0.1)',
          medium: 'rgba(255, 255, 255, 0.2)',
          dark: 'rgba(0, 0, 0, 0.1)',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        hindi: ['Noto Sans Devanagari', 'sans-serif'],
        tamil: ['Noto Sans Tamil', 'sans-serif'],
        bengali: ['Noto Sans Bengali', 'sans-serif'],
        gujarati: ['Noto Sans Gujarati', 'sans-serif'],
        kannada: ['Noto Sans Kannada', 'sans-serif'],
        malayalam: ['Noto Sans Malayalam', 'sans-serif'],
        punjabi: ['Noto Sans Gurmukhi', 'sans-serif'],
        telugu: ['Noto Sans Telugu', 'sans-serif'],
        odia: ['Noto Sans Oriya', 'sans-serif'],
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      },
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
      },
      animation: {
        // Legacy animations (preserved for backward compatibility)
        'gradient': 'gradient 15s ease infinite',
        'float': 'float 3s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite',
        'shimmer': 'shimmer 2s infinite',
        'bounce-dot': 'bounce-dot 1.4s infinite',
        'ripple': 'ripple 0.6s ease-out',
        'slide-in': 'slide-in 0.3s ease-out',
        'fade-in': 'fade-in 0.3s ease-out',
        'scale-in': 'scale-in 0.4s ease-out',
        // Premium landing page animations
        'gradient-mesh': 'gradient-mesh 15s ease infinite',
        'glow-pulse': 'glow-pulse 2s ease-in-out infinite',
        'rotate-slow': 'rotate-slow 20s linear infinite',
        'particle-float': 'particle-float 8s ease-in-out infinite',
      },
      keyframes: {
        // Legacy keyframes (preserved for backward compatibility)
        gradient: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        glow: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(255, 153, 51, 0.5)' },
          '50%': { boxShadow: '0 0 40px rgba(255, 153, 51, 0.8)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-1000px 0' },
          '100%': { backgroundPosition: '1000px 0' },
        },
        'bounce-dot': {
          '0%, 60%, 100%': { transform: 'translateY(0)' },
          '30%': { transform: 'translateY(-10px)' },
        },
        ripple: {
          'to': { transform: 'scale(4)', opacity: '0' },
        },
        'slide-in': {
          'from': { transform: 'translateY(-20px)', opacity: '0' },
          'to': { transform: 'translateY(0)', opacity: '1' },
        },
        'fade-in': {
          'from': { opacity: '0' },
          'to': { opacity: '1' },
        },
        'scale-in': {
          'from': { transform: 'scale(0.95)', opacity: '0' },
          'to': { transform: 'scale(1)', opacity: '1' },
        },
        // Premium landing page keyframes
        'gradient-mesh': {
          '0%, 100%': { transform: 'translate(0, 0)' },
          '50%': { transform: 'translate(100px, 50px)' },
        },
        'glow-pulse': {
          '0%, 100%': { boxShadow: '0 0 20px rgba(255, 122, 24, 0.4)' },
          '50%': { boxShadow: '0 0 40px rgba(255, 122, 24, 0.8)' },
        },
        'rotate-slow': {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        'particle-float': {
          '0%': { transform: 'translateY(0)', opacity: '0.3' },
          '50%': { opacity: '0.6' },
          '100%': { transform: 'translateY(-100px)', opacity: '0.3' },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
      transitionDuration: {
        '400': '400ms',
      },
    },
  },
  plugins: [],
}
