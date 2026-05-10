/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,html}'],
  theme: {
    extend: {
      colors: {
        brand: {
          blue: '#2563EB',
          'blue-dark': '#1D4ED8',
          'blue-light': '#EFF6FF',
          orange: '#EA580C',
          'orange-light': '#FFF7ED',
          green: '#16A34A',
          'green-light': '#F0FDF4',
          purple: '#7C3AED',
          'purple-light': '#F5F3FF',
          dark: '#111827',
          text: '#374151',
          muted: '#6B7280',
          border: '#E5E7EB',
          bg: '#F9FAFB',
        },
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 1px 3px rgba(0,0,0,0.07), 0 4px 16px rgba(0,0,0,0.05)',
        'soft-md': '0 4px 12px rgba(0,0,0,0.08), 0 12px 32px rgba(0,0,0,0.06)',
      },
    },
  },
  plugins: [],
};
