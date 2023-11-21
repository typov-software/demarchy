<script lang="ts">
	let theme: string | null = null;

	function updateTheme(t: string) {
		document.querySelector('html')?.setAttribute('data-theme', t);
		localStorage.setItem('theme', t);
	}

	function onToggleMode() {
		const stored = window.localStorage.getItem('theme');
		const prefersDark = window.matchMedia('(prefers-color-scheme: dark').matches;
		const lastTheme = stored ? stored : prefersDark ? 'dark' : 'light';
		if (stored) {
			theme = lastTheme === 'dark' ? 'light' : 'dark';
		} else {
			theme = prefersDark ? 'light' : 'dark';
		}
		updateTheme(theme);
	}

	function applyStored() {
		let stored = window.localStorage.getItem('theme');
		if (stored) {
			theme = stored;
			updateTheme(stored);
		}
	}

	// once the window is available look for localStorage value
	if (typeof window !== 'undefined' && window?.localStorage) {
		applyStored();
	}
</script>

<header class="flex flex-row items-center">
	<button class="btn btn-square">
		<svg
			width="24"
			height="24"
			viewBox="0 0 24 24"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
			class="d-menu"
		>
			<g clip-path="url(#clip0_154_35)">
				<path d="M3 18H21V16H3V18ZM3 13H21V11H3V13ZM3 6V8H21V6H3Z" />
			</g>
			<defs>
				<clipPath id="clip0_154_35">
					<rect width="24" height="24" fill="white" />
				</clipPath>
			</defs>
		</svg>
	</button>

	<div class="flex flex-1" />

	<div class="theme-toggle flex flex-row">
		<span role="img" class="sun">☀️</span>
		<input type="checkbox" class="toggle" checked={theme === 'dark'} on:change={onToggleMode} />
		<span role="img" class="moon">🌘</span>
	</div>
</header>

<style lang="scss">
	[data-theme='dark'] {
		svg.d-menu path {
			fill: #ffffff;
		}
		.theme-toggle {
			.moon {
				opacity: 1;
			}
			.sun {
				opacity: 0.2;
			}
		}
	}
	[data-theme='light'] {
		svg.d-menu path {
			fill: #000000;
		}
		.theme-toggle {
			.moon {
				opacity: 0.2;
			}
			.sun {
				opacity: 1;
			}
		}
	}
</style>
