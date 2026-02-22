import forms from '@tailwindcss/forms';

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        netflix: {
          black: '#141414',
          dark: '#181818',
          card: '#232323',
          hover: '#2a2a2a',
          red: '#E50914',
          'red-hover': '#f6121d',
        },
        primary: '#E50914',
        secondary: '#141414',
        dark: '#0a0a0a',
        light: '#e5e5e5',
        muted: '#808080',
        success: '#46d369',
        error: '#E50914',
        warning: '#e8b708',
      },
      spacing: {
        128: '32rem',
        144: '36rem',
      },
      animation: {
        'pulse': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'slide-in': 'slideIn 0.5s ease-out',
        'fade-up': 'fadeUp 0.6s ease-out',
        'scale-in': 'scaleIn 0.3s ease-out',
      },
      keyframes: {
        slideIn: {
          '0%': { transform: 'translateX(-10px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        fadeUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
    },
  },
  plugins: [forms],
};
