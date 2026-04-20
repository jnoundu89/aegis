import adapter from '@sveltejs/adapter-static';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	compilerOptions: {
		// Force runes mode for the project, except for libraries. Can be removed in svelte 6.
		runes: ({ filename }) => (filename.split(/[/\\]/).includes('node_modules') ? undefined : true)
	},
	kit: {
		// adapter-static is required for Tauri integration (serves from apps/web/build).
		adapter: adapter({
			fallback: 'index.html'
		}),
		paths: {
			// Use /aegis base path in production (GitHub Pages), root in dev
			base: process.argv.includes('dev') ? '' : '/aegis'
		}
	}
};

export default config;
