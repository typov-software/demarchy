import { writable } from 'svelte/store';

export type Theme = 'light' | 'dark';

function themeStore() {
	const { subscribe, set } = writable<Theme | null>(null);
	return {
		subscribe,
		set
	};
}

export const theme = themeStore();

export function updateTheme(nextTheme: Theme) {
	document.querySelector('html')?.setAttribute('data-theme', nextTheme);
	localStorage.setItem('theme', nextTheme);
	theme.set(nextTheme);
}

export function toggleTheme() {
	const stored = localStorage.getItem('theme');
	const prefersDark = matchMedia('(prefers-color-scheme: dark').matches;
	const lastTheme = stored ? stored : prefersDark ? 'dark' : 'light';
	let nextTheme: Theme;
	if (stored) {
		nextTheme = lastTheme === 'dark' ? 'light' : 'dark';
	} else {
		nextTheme = prefersDark ? 'light' : 'dark';
	}
	updateTheme(nextTheme);
}

export function applyStoredTheme() {
	const stored = localStorage.getItem('theme') as Theme;
	const prefersDark = matchMedia('(prefers-color-scheme: dark').matches;
	const lastTheme = stored ? stored : prefersDark ? 'dark' : 'light';
	if (lastTheme) {
		updateTheme(lastTheme);
	}
}
