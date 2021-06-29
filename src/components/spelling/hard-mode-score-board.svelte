<script>
	export let question_result

	import gsap from 'gsap'
	import {sound} from './Sound'
	import {createEventDispatcher, onMount} from 'svelte'
	import AlphabetScore from './alphabet-score.svelte'
	import Alphabet from './alphabet.svelte'
	import ScoreSVG from './score-svg.svelte'
	const dispatch = createEventDispatcher()

	let panel_el
	let alphabet_score_el
	let button_row_el

	$: total_score = question_result.length
	$: score = question_result.filter(r => r.result === true).length
	$: derived_score = Math.ceil(score / total_score * 10)
	$: {console.log(question_result, total_score, score)}

	const restartEasy = () => {
		dispatch('restart-easy')
		sound.play('casino-notification')
	}

	const restartNormal = () => {
		dispatch('restart-normal')
		sound.play('casino-notification')
	}

	onMount(() => {
		gsap.set([alphabet_score_el, button_row_el], {
			autoAlpha: 0
		})
		sound.play('bonus-extra')
		gsap.timeline().fromTo(panel_el, {
			y: "+=100",
			scale: 0
		}, {
			scale: 1,
			y: "-=100",
			autoAlpha: 1,
			ease: "back.out",
			duration: 0.35
		}).fromTo(alphabet_score_el, {
			rotate: "-=30"
		}, {
			rotate: "+=30",
			autoAlpha: 1,
			onStart: () => {
				sound.play('treasure')
			}
		}).fromTo(button_row_el, {
			y: "-=100"
		}, {
			autoAlpha: 1,
			y: "+=100",
			onStart: () => {
				sound.play('changing-tab')
			}
		})
	})
</script>

<div bind:this={panel_el} class="fixed z-50 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
	<div class="relative z-10 flex justify-center -mb-6">
		<ScoreSVG color="#918CF0"/>
	</div>
	<div class="relative font-bold border-4 px-8 pt-12 pb-4 border-purple-500 text-center" style="border-radius: 3em; background: #FAFAFA">
		<div class="mb-4" bind:this={alphabet_score_el}>
			<AlphabetScore score={derived_score}/>
		</div>
		<div class="grid gap-4 grid-cols-2 text-xl" bind:this={button_row_el}>
			<button on:click={restartEasy} class="bg-white text-purple-500 border-purple-500 border-2 px-8 py-4 rounded-full font-bold">訓練</button>
			<button on:click={restartNormal} class="bg-purple-700 border-purple-500 border-4 text-white px-8 whitespace-nowrap py-4 rounded-full font-bold" style="color: #F69CCA; background: #535AAB">再挑戰</button>
		</div>
		<div class="absolute top-4 right-4 flex items-center">
			<Alphabet char={score} height_class="h-6" text_color="white" stroke_color="#918CF0"/>
			<Alphabet char="/" height_class="h-4" text_color="white" stroke_color="#918CF0"/>
			<Alphabet char={total_score} height_class="h-6" text_color="white" stroke_color="#918CF0"/>
		</div>
	</div>
</div>