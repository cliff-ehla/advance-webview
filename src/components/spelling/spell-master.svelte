<script>
	export let phases
	export let hp
	export let question_result
	export let mode

	import Spell from './spell2.svelte'
	import {onMount, getContext, tick, createEventDispatcher} from 'svelte'
	import {sound} from "./Sound";

	let render = false
	let all_audio_loaded = false
	let idx = 0

	$: phase = phases[idx]

	const dispatch = createEventDispatcher()
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
		let result = phases.map((p,i) => ({
			...p,
			spelling_result: question_result[i]
		}))
		const message = {
			type: 'spelling:result',
			data: result
		}

		window.postMessage(JSON.stringify(message)) // TODO
		dispatch('game-end')
	}

	const initQuestion = () => {
		render = true
	}

	const onGameOver = () => {
		render = false
		sound.play('player-losing')
	}

	onMount(async () => {
		all_audio_loaded = true
		initQuestion()
	})

	const onKeydown = (e) => {
		if (e.keyCode === 40) {
			endGame()
		}
	}
</script>

{#if all_audio_loaded && render}
	<Spell on:game-over={onGameOver} on:next={onNext} words={phase.words} phase_audio={phase.phase_audio} {hp} phase_idx={idx} {mode}/>
{/if}

<svelte:window on:keydown={onKeydown}/>