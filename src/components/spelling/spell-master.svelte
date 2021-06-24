<script>
	export let phases
	export let hp
	export let question_result

	import Spell from './spell2.svelte'
	import {onMount, getContext, tick} from 'svelte'
	import {sound} from "./Sound";

	let render = false
	let all_audio_loaded = false
	let idx = 0

	$: phase = phases[idx]

	const {setCheckpointSuccess, setCheckpointActive} = getContext('spell-game-bar')

	const onNext = e => {
		endQuestion()
	}

	const endQuestion = async () => {
		render = false
		if (idx === phases.length - 1) {
			endGame()
		} else {
			idx++
			await tick()
			initQuestion()
		}
	}

	const endGame = async () => {
		await sound.play('bonus-extra')
		console.log(question_result)
	}

	const initQuestion = () => {
		render = true
	}

	onMount(async () => {
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
		all_audio_loaded = true
		initQuestion()
	})
</script>

{#if all_audio_loaded && render}
	<Spell on:next={onNext} words={phase.words} phase_audio={phase.phase_audio} {hp} phase_idx={idx}></Spell>
{/if}
