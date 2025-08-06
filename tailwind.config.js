/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#0ce4ac',
          50: '#f0fdf9',
          100: '#ccfbef',
          500: '#0ce4ac',
          600: '#0bc49a',
          900: '#064e3b',
        },
        secondary: {
          DEFAULT: '#172c3b',
          50: '#f8fafc',
          100: '#f1f5f9',
          500: '#172c3b',
          600: '#0f172a',
          900: '#020617',
        },
        neutral: '#A9A9A9',
        destructive: '#ef4444',
        muted: '#f5f5f5',
        'muted-foreground': '#737373',
        border: '#e5e5e5',
        input: '#ffffff',
        ring: '#0ce4ac',
      },
      borderColor: {
        DEFAULT: '#e5e5e5',
      },
      ringColor: {
        DEFAULT: '#0ce4ac',
      },
    },
  },
  plugins: [],
};
