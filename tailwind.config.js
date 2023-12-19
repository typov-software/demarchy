const sharedThemeOptions = {
  '--rounded-box': '0', // border radius rounded-box utility class, used in card and other large boxes
  '--rounded-btn': '0', // border radius rounded-btn utility class, used in buttons and similar element
  '--rounded-badge': '1.9rem', // border radius rounded-badge utility class, used in badges and similar
  '--animation-btn': '0.25s', // duration of animation when you click on button
  '--animation-input': '0.2s', // duration of animation for inputs like checkbox, toggle, radio, etc
  '--btn-focus-scale': '1', // scale transform of button when you focus on it
  '--border-btn': '1px', // border width of buttons
  '--tab-border': '1px', // border width of tabs
  '--tab-radius': '0.5rem', // border radius of tabs
  info: '#0000ff',
  success: '#00FF00',
  warning: '#ffff00',
  error: '#ff0000'
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
          primary: '#0000FF',
          secondary: '#FF0000',
          accent: '#FF00FF',
          neutral: '#000000',
          'base-100': 'oklch(100% 0 0)',
          'base-200': '#F2F2F2',
          'base-300': '#E6E5E5',
          'base-content': '#000000'
        }
      },
      {
        dark: {
          ...sharedThemeOptions,
          'color-scheme': 'dark',
          primary: '#FF0000',
          secondary: '#0000FF',
          accent: '#FF00FF',
          neutral: '#FFFFFF',
          'base-100': '#090909',
          'base-200': '#141414',
          'base-300': '#262626',
          'base-content': '#d6d6d6'
        }
      }
    ]
  }
};
