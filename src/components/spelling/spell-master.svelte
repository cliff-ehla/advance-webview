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
		let result = phases.map((p,i) => ({
			...p,
			spelling_result: question_result[i]
		}))
		const message = {
			type: 'spelling:result',
			data: result
		}
		window.postMessage(JSON.stringify(message))
	}

	const initQuestion = () => {
		render = true
	}

	onMount(async () => {
		all_audio_loaded = true
		initQuestion()
	})
</script>

{#if all_audio_loaded && render}
	<Spell on:next={onNext} words={phase.words} phase_audio={phase.phase_audio} {hp} phase_idx={idx}></Spell>
{/if}
