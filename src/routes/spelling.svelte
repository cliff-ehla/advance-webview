<script>
	import SpellGameBar from '../components/spelling/spell-game-bar.svelte'
	import {onMount} from 'svelte'
	import {sound} from "../components/spelling/Sound";
	import {stores} from '@sapper/app'
	const {page} = stores()

	let start = false
	let phases = []

	let loaded = false

	const convertData = () => {
		phases.forEach(v => {
			v.phase = v.word
			v.phase_audio = v.audio_path
			v.subwords.forEach(s => {
				s.audio = s.audio_path
			})
			v.words = v.subwords.map(s => ({
				audio: s.audio_path,
				word: s.word
			}))
		})
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
		const audio_sfx = ['tap', 'tap-2', 'stone-hit', 'collected-coin', 'magic-unlock', 'magic-unlock-2', 'boom', 'mechanical-crate-pick-up', 'bonus-earned', 'extra-bonus', 'treasure', 'flute-alert', 'negative-guitar-tone', 'bonus-extra', 'sci-fi-laser', 'flute-alert-short', 'ball-tap']
		audio_sfx.forEach(key => {
			sound.load(key, `/sound/${key}.mp3`)
		})
		await sound.loadBatch(all_audios)
	}

	onMount(async () => {
		phases = $page.query.words
		if (!(phases && phases.length)) return console.log('nothing from query')
		else phases = JSON.parse(decodeURIComponent(phases))
		convertData()
		await loadAudio()
		loaded = true
	})
</script>

<svelte:window on:click={() => start = true} on:touchstart={() => start = true}/>
{#if start}
	<SpellGameBar phases={phases} mode="normal"/>
{:else}
	<div class="w-screen h-screen flex items-center justify-center">
		<div class="text-center">
			<p class="text-gray-400">Spelling game:</p>
			<p>Touch the screen to start</p>
		</div>
	</div>
{/if}

