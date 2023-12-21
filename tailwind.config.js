const sharedThemeOptions = {
  '--rounded-box': '1.5rem', // border radius rounded-box utility class, used in card and other large boxes
  '--rounded-btn': '1rem', // border radius rounded-btn utility class, used in buttons and similar element
  '--rounded-badge': '1.9rem', // border radius rounded-badge utility class, used in badges and similar
  '--animation-btn': '0.25s', // duration of animation when you click on button
  '--animation-input': '0.2s', // duration of animation for inputs like checkbox, toggle, radio, etc
  '--btn-focus-scale': '1', // scale transform of button when you focus on it
  '--border-btn': '1px', // border width of buttons
  '--tab-border': '1px', // border width of tabs
  '--tab-radius': '0.5rem', // border radius of tabs
  info: '#818cf8',
  success: '#22c55e',
  warning: '#fbbf24',
  error: '#ef4444',
  primary: '#1d4ed8',
  secondary: '#e11d48',
  accent: '#f472b6'
};

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{html,js,svelte,ts}'],
  plugins: [require('@tailwindcss/typography'), require('daisyui')],
  theme: {
    extend: {},
    fontFamily: {
      sans: ['Fira Code', 'monospace']
    }
  },
  daisyui: {
    themes: [
      {
        light: {
          ...sharedThemeOptions,
          'color-scheme': 'light',
          neutral: '#a1a1aa',
          'base-100': '#f4f4f5',
          'base-200': '#e4e4e7',
          'base-300': '#d4d4d8',
          'base-content': '#09090b'
        }
      },
      {
        dark: {
          ...sharedThemeOptions,
          'color-scheme': 'dark',
          neutral: '#3f3f46',
          'base-100': '#09090b',
          'base-200': '#18181b',
          'base-300': '#27272a',
          'base-content': '#f4f4f5'
        }
      }
    ]
  }
};
