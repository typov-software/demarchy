import daisyui from 'daisyui';
import typography from '@tailwindcss/typography';
import { type Config } from 'tailwindcss';

const sharedThemeOptions = {
  primary: '#2563eb',
  secondary: '#e11d48',
  accent: '#d946ef',
  success: '#22c55e',
  info: '#0ea5e9',
  warning: '#fbbf24',
  error: '#ef4444',

  '--rounded-box': '0rem', // border radius rounded-box utility class, used in card and other large boxes
  '--rounded-btn': '0rem', // border radius rounded-btn utility class, used in buttons and similar element
  '--rounded-badge': '0rem', // border radius rounded-badge utility class, used in badges and similar
  '--animation-btn': '0s', // duration of animation when you click on button
  '--animation-input': '0s', // duration of animation for inputs like checkbox, toggle, radio, etc
  '--btn-focus-scale': '0.98', // scale transform of button when you focus on it
  '--border-btn': '1px', // border width of buttons
  '--tab-border': '1px', // border width of tabs
  '--tab-radius': '0rem', // border radius of tabs
  '.prose *': {
    marginTop: '0',
    marginBottom: '0',
  },
};

/** @type {import('tailwindcss').Config} */
const config: Config = {
  content: ['./src/**/*.{html,js,svelte,ts}'],
  plugins: [typography, daisyui],
  theme: {
    extend: {},
    fontFamily: {
      sans: ['Fira Code', 'monospace'],
      prompt: ['Prompt', 'sans-serif'],
      noto: ['Noto Sans', 'sans-serif'],
    },
  },
  daisyui: {
    themes: [
      {
        light: {
          ...sharedThemeOptions,
          'color-scheme': 'light',
          neutral: '#a1a1aa',
          'base-100': '#f4f4f5',
        },
      },
      {
        dark: {
          ...sharedThemeOptions,
          'color-scheme': 'dark',
          neutral: '#a1a1aa',
          'base-100': '#111111',
        },
      },
    ],
  },
};

export default config;
