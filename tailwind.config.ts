import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: {
          950: '#0a0a0a',
          900: '#121212',
          800: '#1c1c1c',
          700: '#282828',
          600: '#3a3a3a',
        },
        brass: {
          400: '#c9a86a',
          500: '#b8935a',
          600: '#a17d47',
        },
      },
      fontFamily: {
        serif: ['"Shippori Mincho"', 'serif'],
        sans: ['"Zen Kaku Gothic New"', 'sans-serif'],
      },
      maxWidth: {
        app: '480px',
      },
    },
  },
  plugins: [],
};

export default config;
