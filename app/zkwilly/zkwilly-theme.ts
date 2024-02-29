import type { CustomThemeConfig } from '@skeletonlabs/tw-plugin';

export const zkWillyTheme: CustomThemeConfig = {
	name: 'zkwilly-theme',
	properties: {
		// =~= Theme Properties =~=
		'--theme-font-family-base': `Silkscreen, ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace, Pixelify`,
		'--theme-font-family-heading': `Silkscreen, ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace, Pixelify`,
		'--theme-font-color-base': '0 0 0',
		'--theme-font-color-dark': '255 255 255',
		'--theme-rounded-base': '9999px',
		'--theme-rounded-container': '8px',
		'--theme-border-base': '1px',
		// =~= Theme On-X Colors =~=
		'--on-primary': '0 0 0',
		'--on-secondary': '255 255 255',
		'--on-tertiary': '0 0 0',
		'--on-success': '0 0 0',
		'--on-warning': '0 0 0',
		'--on-error': '255 255 255',
		'--on-surface': '255 255 255',
		// =~= Theme Colors  =~=
		// primary | #ffffff
		'--color-primary-50': '255 255 255', // #ffffff
		'--color-primary-100': '255 255 255', // #ffffff
		'--color-primary-200': '255 255 255', // #ffffff
		'--color-primary-300': '255 255 255', // #ffffff
		'--color-primary-400': '255 255 255', // #ffffff
		'--color-primary-500': '255 255 255', // #ffffff
		'--color-primary-600': '230 230 230', // #e6e6e6
		'--color-primary-700': '191 191 191', // #bfbfbf
		'--color-primary-800': '153 153 153', // #999999
		'--color-primary-900': '125 125 125', // #7d7d7d
		// secondary | #000000
		'--color-secondary-50': '217 217 217', // #d9d9d9
		'--color-secondary-100': '204 204 204', // #cccccc
		'--color-secondary-200': '191 191 191', // #bfbfbf
		'--color-secondary-300': '153 153 153', // #999999
		'--color-secondary-400': '77 77 77', // #4d4d4d
		'--color-secondary-500': '0 0 0', // #000000
		'--color-secondary-600': '0 0 0', // #000000
		'--color-secondary-700': '0 0 0', // #000000
		'--color-secondary-800': '0 0 0', // #000000
		'--color-secondary-900': '0 0 0', // #000000
		// tertiary | #b3f6ff
		'--color-tertiary-50': '244 254 255', // #f4feff
		'--color-tertiary-100': '240 253 255', // #f0fdff
		'--color-tertiary-200': '236 253 255', // #ecfdff
		'--color-tertiary-300': '225 251 255', // #e1fbff
		'--color-tertiary-400': '202 249 255', // #caf9ff
		'--color-tertiary-500': '179 246 255', // #b3f6ff
		'--color-tertiary-600': '161 221 230', // #a1dde6
		'--color-tertiary-700': '134 185 191', // #86b9bf
		'--color-tertiary-800': '107 148 153', // #6b9499
		'--color-tertiary-900': '88 121 125', // #58797d
		// success | #84cc16
		'--color-success-50': '237 247 220', // #edf7dc
		'--color-success-100': '230 245 208', // #e6f5d0
		'--color-success-200': '224 242 197', // #e0f2c5
		'--color-success-300': '206 235 162', // #ceeba2
		'--color-success-400': '169 219 92', // #a9db5c
		'--color-success-500': '132 204 22', // #84cc16
		'--color-success-600': '119 184 20', // #77b814
		'--color-success-700': '99 153 17', // #639911
		'--color-success-800': '79 122 13', // #4f7a0d
		'--color-success-900': '65 100 11', // #41640b
		// warning | #EAB308
		'--color-warning-50': '252 244 218', // #fcf4da
		'--color-warning-100': '251 240 206', // #fbf0ce
		'--color-warning-200': '250 236 193', // #faecc1
		'--color-warning-300': '247 225 156', // #f7e19c
		'--color-warning-400': '240 202 82', // #f0ca52
		'--color-warning-500': '234 179 8', // #EAB308
		'--color-warning-600': '211 161 7', // #d3a107
		'--color-warning-700': '176 134 6', // #b08606
		'--color-warning-800': '140 107 5', // #8c6b05
		'--color-warning-900': '115 88 4', // #735804
		// error | #D41976
		'--color-error-50': '249 221 234', // #f9ddea
		'--color-error-100': '246 209 228', // #f6d1e4
		'--color-error-200': '244 198 221', // #f4c6dd
		'--color-error-300': '238 163 200', // #eea3c8
		'--color-error-400': '225 94 159', // #e15e9f
		'--color-error-500': '212 25 118', // #D41976
		'--color-error-600': '191 23 106', // #bf176a
		'--color-error-700': '159 19 89', // #9f1359
		'--color-error-800': '127 15 71', // #7f0f47
		'--color-error-900': '104 12 58', // #680c3a
		// surface | #525252
		'--color-surface-50': '229 229 229', // #e5e5e5
		'--color-surface-100': '220 220 220', // #dcdcdc
		'--color-surface-200': '212 212 212', // #d4d4d4
		'--color-surface-300': '186 186 186', // #bababa
		'--color-surface-400': '134 134 134', // #868686
		'--color-surface-500': '82 82 82', // #525252
		'--color-surface-600': '74 74 74', // #4a4a4a
		'--color-surface-700': '62 62 62', // #3e3e3e
		'--color-surface-800': '49 49 49', // #313131
		'--color-surface-900': '40 40 40' // #282828
	}
};
