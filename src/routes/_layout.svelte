<script context="module">
	import { init, waitLocale, register } from 'svelte-i18n'

	export async function preload(page) {
		register('en', () => import('../locales/en.js'))
		register('hk', () => import('../locales/hk.js'))
		let lang_query = page.query.lang
		if (!['en', 'hk'].includes(lang_query)) lang_query = null
		const initialLocale = lang_query || 'en'
		init({
			fallbackLocale: 'hk',
			initialLocale
		})
		return waitLocale()
	}
</script>

<slot></slot>