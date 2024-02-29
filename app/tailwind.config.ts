import { join } from 'path';
import type { Config } from 'tailwindcss';
import { skeleton } from '@skeletonlabs/tw-plugin';
import { zkWillyTheme } from './zkwilly-theme';

export default {
	darkMode: 'class',
	content: [
		'./src/**/*.{html,js,svelte,ts}',
		join(require.resolve('@skeletonlabs/skeleton'), '../**/*.{html,js,svelte,ts}')
	],
	theme: {
		extend: {
			fontFamily: {
				customFont: ['"Pixelify Sans"']
				// Add more custom font families as needed
			}
		}
	},
	plugins: [
		skeleton({
			themes: {
				custom: [zkWillyTheme]
			}
		})
	]
} satisfies Config;
