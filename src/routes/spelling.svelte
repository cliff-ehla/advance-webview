<script>
	import * as Sentry from "@sentry/browser";
	import { BrowserTracing } from "@sentry/tracing";
	import {t, locale} from 'svelte-i18n'
	import SpellGameBar from '../components/spelling/spell-game-bar.svelte'
	import {onMount, tick} from 'svelte'
	import {sound} from "../components/spelling/Sound";
	import gsap from 'gsap'
	import {stores} from "@sapper/app";
	const {page} = stores()

	let phases
	let selected_mode

	// element
	let left_card
	let left_button
	let right_card
	let right_button

	let loaded_image_count = 0
	let is_challenge_only = false

	const convertData = () => {
		phases.forEach(v => {
			v.phase = v.word
			v.phase_audio = v.audio_path
			if (!v.subwords) {
				v.subwords = [
					{
						audio: v.audio_path,
						audio_path: v.audio_path,
						word: v.word
					}
				]
			}
			v.subwords.forEach(s => {
				s.audio = s.audio_path
			})
			v.words = v.subwords.map(s => ({
				audio: s.audio_path,
				word: s.word
			}))
		})
		console.log('convert data: ', phases)
	}

	const loadAudio = async () => {
		const all_phase_audios = phases.map(p => p.phase_audio).filter(v => !!v)
		const all_word = phases.map(p => p.words.map(w => w.word)).reduce((a,b) => [...a, ...b], []).filter(a => !!a)
		let all_chars = Array.from(new Set(all_word.map(w => w.toLowerCase()).join().split(''))).sort()
		all_chars = all_chars.filter(c => /^[a-zA-Z()]+$/.test(c))
		all_chars.forEach(char => {
			sound.load(char, `https://ehla-media-bucket.s3-ap-southeast-1.amazonaws.com/baby/sounds/alphabets/${char}.mp3`)
		})
		let all_audios = phases.map(p => p.words.map(w => w.audio)).reduce((a,b) => [...a, ...b], []).filter(a => !!a)
		all_audios = [...all_audios, ...all_phase_audios]
		const audio_sfx = ['tap', 'tap-2', 'stone-hit', 'collected-coin', 'magic-unlock', 'magic-unlock-2', 'boom', 'mechanical-crate-pick-up', 'bonus-earned', 'extra-bonus', 'treasure', 'flute-alert', 'negative-guitar-tone', 'bonus-extra', 'sci-fi-laser', 'flute-alert-short', 'ball-tap', 'game-coin-touch', 'treasure-coin', 'player-losing', 'health-recharge', 'game-bonus-reached', 'changing-tab', 'casino-notification', 'wrong-electricity-buzz']
		audio_sfx.forEach(key => {
			sound.load(key, `/sound/${key}.mp3`)
		})
		await sound.loadBatch(all_audios)
	}

	onMount(async () => {
		Sentry.init({
			dsn: "https://2ed4bf4c5e744b61821fa3fb47dd84db@o1067583.ingest.sentry.io/4504287052431360",
			integrations: [new BrowserTracing()],

			// Set tracesSampleRate to 1.0 to capture 100%
			// of transactions for performance monitoring.
			// We recommend adjusting this value in production
			tracesSampleRate: 1.0,
		});

		gsap.set([right_button, left_card, left_button, right_button], {
			autoAlpha: 0
		})
		const onMessage = (e) => {
			const data = JSON.parse(e.data)
			let type = data.type
			if (type === 'setData') {
				let {words, lang, challenge_only} = data.data
				lang = lang || 'hk'
				locale.set(lang)
				phases = words
				is_challenge_only = challenge_only
				setTimeout(introAnimation, 500)
				convertData()
				loadAudio()
				console.log('set data', words)
			}
		}
		window.addEventListener('message', onMessage)
		document.addEventListener('message', onMessage)
		if ($page.query.testing2) {
			phases =  [
				{
					"id": "43220",
					"word": "schoolwork",
					"description": null,
					"description_alter": null,
					"audio_path": "https://ehla-media-bucket.s3.amazonaws.com/ehlapolly/37/2246/Amy-standard-5f1ff692285872c0bc30c251527aab7a-1622702176.mp3",
					"image_path": "https://ehla-media-bucket.s3.amazonaws.com/assets/vocab_image/vocabulary.png",
					"subwords": [{
						"word": "schoolwork",
						"audio_path": "https://ehla-media-bucket.s3.amazonaws.com/word_audio_20190429/striped-1560754496808.mp3"
					}]
				},
				{
					"id": "43220",
					"word": "striped jumper",
					"description": null,
					"description_alter": null,
					"audio_path": "https://ehla-media-bucket.s3.amazonaws.com/ehlapolly/37/2246/Amy-standard-5f1ff692285872c0bc30c251527aab7a-1622702176.mp3",
					"image_path": "https://ehla-media-bucket.s3.amazonaws.com/assets/vocab_image/vocabulary.png",
					"subwords": [{
						"word": "striped",
						"audio_path": "https://ehla-media-bucket.s3.amazonaws.com/word_audio_20190429/striped-1560754496808.mp3"
					}, {
						"word": "jumper",
						"audio_path": "https://ehla-media-bucket.s3.amazonaws.com/word_audio_20190429/jumper-1559633903326.mp3"
					}]
				}
			]
			setTimeout(introAnimation, 200)
			convertData()
			loadAudio()
		}
	})

	const introAnimation = () => {
		gsap.set(left_card, {
			transformOrigin: 'left bottom'
		})
		gsap.set(right_card, {
			transformOrigin: 'right bottom'
		})
		gsap.set([left_button, right_button], {
			x: '-=50%'
		})
		gsap.timeline().fromTo(left_card, {
			rotate: -70,
			scale: 0.7
		}, {
			rotate: -8,
			scale: 1,
			duration: 0.5,
			autoAlpha: is_challenge_only ? 0.85 : 1,
			ease: 'back.out'
		}).fromTo(left_button, {
			y: "+=30",
		}, {
			y: "-=30",
			duration: 0.5,
			autoAlpha: is_challenge_only ? 0.7: 1
		}, ">-0.3").fromTo(right_card, {
			rotate: 50,
			scale: 0.8
		}, {
			rotate: 10,
			scale: 1,
			duration: 0.5,
			autoAlpha: 1,
			ease: 'back.out'
		}, ">-0.5").fromTo(right_button, {
			y: "+=30",
		}, {
			y: 0,
			duration: 0.5,
			autoAlpha: 1
		}, ">-0.3")
	}

	const onImageLoad = () => {
		loaded_image_count++
		if (loaded_image_count === 4) {
			console.log('all image loaded')
			// setTimeout(() => {
			// 	introAnimation()
			// 	console.log('intro animation after loaded image')
			// }, 50)
		}
	}

	const onExit = async () => {
		selected_mode = null
		await tick()
		introAnimation()
	}

	const restart = async (mode) => {
		selected_mode = null
		await tick()
		selected_mode = mode
	}

	const onBack = () => {
		const message = {
			type: 'exit'
		}
		window.postMessage(JSON.stringify(message))
		if (window.IS_WEB_VIEW) {
			try {
				window.ReactNativeWebView.postMessage(JSON.stringify(message))
			} catch (e) {}
		}
	}

	const onSelect = (mode) => {
		if (is_challenge_only && mode === 'easy') return sound.play('wrong-electricity-buzz')
		selected_mode = mode
		sound.play('casino-notification')
	}
</script>

{#if selected_mode}
	<SpellGameBar on:restart-easy={() => restart('easy')} on:restart-normal={() => restart('normal')} on:exit={onExit} phases={phases} mode={selected_mode} {is_challenge_only}/>
{:else}
	<svg on:click={onBack} class="z-30 fixed left-4 top-4 w-10" viewBox="0 0 42 42" fill="none" xmlns="http://www.w3.org/2000/svg">
		<path fill-rule="evenodd" clip-rule="evenodd" d="M22.6213 8.12132C23.7929 6.94975 23.7929 5.05025 22.6213 3.87868C21.4497 2.70711 19.5503 2.70711 18.3787 3.87868L3.87868 18.3787C2.72112 19.5362 2.70526 21.4081 3.84304 22.5851L18.343 37.5851C19.4946 38.7763 21.3938 38.8085 22.5851 37.657C23.7763 36.5054 23.8085 34.6062 22.657 33.4149L13.5559 24H35.5C37.1569 24 38.5 22.6569 38.5 21C38.5 19.3431 37.1569 18 35.5 18H12.7426L22.6213 8.12132Z" fill="white"/>
		<path fill-rule="evenodd" clip-rule="evenodd" d="M24.7426 1.75736C27.0858 4.10051 27.0858 7.89949 24.7426 10.2426L19.9853 15H35.5C38.8137 15 41.5 17.6863 41.5 21C41.5 24.3137 38.8137 27 35.5 27H20.6284L24.8139 31.3299C27.117 33.7124 27.0527 37.5108 24.6701 39.8139C22.2876 42.117 18.4892 42.0527 16.1861 39.6701L1.68607 24.6701C-0.589479 22.3161 -0.557754 18.5725 1.75736 16.2574L3.87868 18.3787C2.72112 19.5362 2.70526 21.4081 3.84304 22.5851L18.343 37.5851C19.4946 38.7763 21.3938 38.8085 22.5851 37.657C23.7763 36.5054 23.8085 34.6062 22.657 33.4149L13.5559 24H35.5C37.1569 24 38.5 22.6569 38.5 21C38.5 19.3431 37.1569 18 35.5 18H12.7426L22.6213 8.12132C23.7929 6.94975 23.7929 5.05025 22.6213 3.87868C21.4497 2.70711 19.5503 2.70711 18.3787 3.87868L3.87868 18.3787L1.75736 16.2574L16.2574 1.75736C18.6005 -0.585787 22.3995 -0.585786 24.7426 1.75736Z" fill="#AFBA3A"/>
	</svg>
	<div class="relative w-screen h-screen flex items-center justify-center px-12" style="background-image: linear-gradient(#FDFFE8,#FBFFCA)">
		<div class="relative z-10 grid gap-8 grid-cols-2">
			<div on:touchstart={() => {onSelect('easy')}} class="relative flex justify-center">
				{#if is_challenge_only}
					<div bind:this={left_card} class="gray-scale w-64 opacity-0 bg-contain bg-no-repeat" style="background-image: url('image/spelling/easy-card-disabled.png'); padding-top: 120%"></div>
				{:else}
					<div bind:this={left_card} class="w-64 opacity-0 bg-contain bg-no-repeat" style="background-image: url('image/spelling/easy-card.png'); padding-top: 120%"></div>
				{/if}
				<img on:load={onImageLoad} bind:this={left_button} src="image/spelling/easy-button-{$locale}.png" alt="card" class="absolute -bottom-4 left-1/2 h-16 opacity-0" class:gray-scale={is_challenge_only}>
			</div>
			<div on:touchstart={() => {onSelect('normal')}} class="relative flex justify-center">
				<div bind:this={right_card} class="w-64 opacity-0 bg-contain bg-no-repeat" style="background-image: url('image/spelling/hard-card.png'); padding-top: 120%"></div>
				<img on:load={onImageLoad} bind:this={right_button} src="image/spelling/hard-button-{$locale}.png" alt="card" class="absolute -bottom-4 left-1/2 h-16 opacity-0">
			</div>
		</div>
		<svg class="absolute bottom-0 inset-x-0 w-full" viewBox="0 0 667 375" fill="none" xmlns="http://www.w3.org/2000/svg">
			<ellipse cx="152.5" cy="387.5" rx="365.5" ry="323.5" fill="#F0F4C5"/>
			<ellipse cx="634.5" cy="315.5" rx="365.5" ry="323.5" fill="#F5F8D8"/>
			<ellipse cx="585.5" cy="387.5" rx="365.5" ry="323.5" fill="#FDFFE8"/>
			<ellipse cx="575" cy="373" rx="332" ry="186" fill="#F0F4C4"/>
			<ellipse cx="23" cy="387" rx="199" ry="194" fill="#F7FFA2"/>
		</svg>
	</div>
{/if}

<style>
	.gray-scale {
			filter: grayscale(100%);
	}
</style>
