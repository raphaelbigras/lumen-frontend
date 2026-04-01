/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        primary: { DEFAULT: '#6366f1', foreground: '#ffffff' },
        accent: { DEFAULT: '#8b5cf6' },
        lumen: {
          bg: { primary: '#0a0a0f', secondary: '#0f1219', tertiary: '#12151e', sidebar: '#0c0e14' },
          border: { primary: '#1e293b', secondary: '#1a1f2e' },
          text: { primary: '#e2e8f0', secondary: '#94a3b8', tertiary: '#64748b' },
          hover: '#151923',
        },
        status: {
          open: { bg: '#1e3a5f', text: '#60a5fa' },
          progress: { bg: '#422006', text: '#fbbf24' },
          pending: { bg: '#431407', text: '#fb923c' },
          resolved: { bg: '#052e16', text: '#34d399' },
          closed: { bg: '#1e293b', text: '#64748b' },
        },
      },
      keyframes: {
        'slide-in': {
          from: { transform: 'translateX(100%)' },
          to: { transform: 'translateX(0)' },
        },
      },
      animation: {
        'slide-in': 'slide-in 0.2s ease-out',
      },
    },
  },
  plugins: [],
};
