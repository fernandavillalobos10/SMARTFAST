/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#fff5ed',
          100: '#ffe8d4',
          200: '#ffcda8',
          300: '#ffa970',
          400: '#ff7a37',
          500: '#fe5a11',
          600: '#ef3f07',
          700: '#c62c08',
          800: '#9d250f',
          900: '#7e2210',
        },
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['Poppins', 'Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 2px rgba(15, 23, 42, 0.04), 0 4px 16px rgba(15, 23, 42, 0.06)',
      },
    },
  },
  plugins: [],
}
