import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vitest/config';
import pkg from './package.json' assert { type: 'json' };

export default defineConfig({
  plugins: [sveltekit()],
  test: {
    include: ['src/**/*.{test,spec}.{js,ts}']
  },
  define: {
    __VERSION__: `"${pkg.version}"`
  },
  build: {
    target: 'esnext'
  }
});
