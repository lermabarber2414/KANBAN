/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        surface: {
          50: '#F8F9FB',
          100: '#F0F2F7',
          200: '#E4E8F0',
          300: '#CDD4E0',
        },
        brand: {
          50: '#EEF2FF',
          100: '#E0E7FF',
          500: '#6366F1',
          600: '#4F46E5',
          700: '#4338CA',
        },
        priority: {
          alta: '#EF4444',
          altaBg: '#FEF2F2',
          altaBorder: '#FECACA',
          media: '#F59E0B',
          mediaBg: '#FFFBEB',
          mediaBorder: '#FDE68A',
          baja: '#10B981',
          bajaBg: '#ECFDF5',
          bajaBorder: '#A7F3D0',
        }
      },
      boxShadow: {
        card: '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)',
        'card-hover': '0 4px 12px rgba(0,0,0,0.08), 0 2px 4px rgba(0,0,0,0.04)',
        modal: '0 20px 60px rgba(0,0,0,0.12), 0 8px 24px rgba(0,0,0,0.08)',
      }
    },
  },
  plugins: [],
}
