const sharedThemeOptions = {
  '--rounded-box': '1rem', // border radius rounded-box utility class, used in card and other large boxes
  '--rounded-btn': '0', // border radius rounded-btn utility class, used in buttons and similar element
  '--rounded-badge': '1.9rem', // border radius rounded-badge utility class, used in badges and similar
  '--animation-btn': '0.25s', // duration of animation when you click on button
  '--animation-input': '0.2s', // duration of animation for inputs like checkbox, toggle, radio, etc
  '--btn-focus-scale': '1', // scale transform of button when you focus on it
  '--border-btn': '1px', // border width of buttons
  '--tab-border': '1px', // border width of tabs
  '--tab-radius': '0.5rem' // border radius of tabs
};

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{html,js,svelte,ts}'],
  plugins: [require('@tailwindcss/typography'), require('daisyui')],
  theme: {
    extend: {}
  },
  daisyui: {
    themes: [
      {
        light: {
          ...sharedThemeOptions,
          'color-scheme': 'light',
          primary: '#0D0D0D',
          'primary-content': 'oklch(100% 0 0)',
          secondary: '#1A1919',
          'secondary-content': 'oklch(100% 0 0)',
          accent: '#262626',
          'accent-content': 'oklch(100% 0 0)',
          neutral: '#000000',
          'neutral-content': 'oklch(100% 0 0)',
          'base-100': 'oklch(100% 0 0)',
          'base-200': '#F2F2F2',
          'base-300': '#E6E5E5',
          'base-content': '#000000',
          info: 'oklch(79.54% 0.103 205.9)',
          success: 'oklch(90.13% 0.153 164.14)',
          warning: 'oklch(88.37% 0.135 79.94)',
          error: 'oklch(78.66% 0.15 28.47)'
        }
      },
      {
        dark: {
          ...sharedThemeOptions,
          'color-scheme': 'dark',
          primary: '#373737',
          secondary: '#373737',
          accent: '#373737',
          'base-100': '#000000',
          'base-200': '#141414',
          'base-300': '#262626',
          'base-content': '#d6d6d6',
          neutral: '#373737',
          info: '#0000ff',
          success: '#008000',
          warning: '#ffff00',
          error: '#ff0000'
        }
      }
    ]
  }
};
