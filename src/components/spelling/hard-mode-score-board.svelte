<script>
	export let question_result
	export let is_challenge_only

	import {t} from 'svelte-i18n'
	import gsap from 'gsap'
	import {sound} from './Sound'
	import {createEventDispatcher, onMount} from 'svelte'
	import AlphabetScore from './alphabet-score.svelte'
	import Alphabet from './alphabet.svelte'
	import ScoreSVG from './score-svg.svelte'
	import Font from './font.svelte'
	const dispatch = createEventDispatcher()

	let panel_el
	let score_el
	let alphabet_score_el
	let button_row_el
	let review_words_el = []
	let reviewed_word_count = 0
	let score = 0
	let fast_forward = false
	let hide_skip_button = false

	$: total_score = question_result.length
	$: derived_score = Math.ceil(score / total_score * 10)

	const restartEasy = () => {
		dispatch('restart-easy')
		sound.play('casino-notification')
	}

	const restartNormal = () => {
		dispatch('restart-normal')
		sound.play('casino-notification')
	}

	const reviewWords = (i) => {
		gsap.timeline().fromTo(review_words_el[i], {
			y: "+=150",
			scale: 0
		}, {
			y: "-=150",
			scale: 1,
			autoAlpha: 1,
			duration: 0.6,
			onComplete: async () => {
				if (!fast_forward) await sound.play(question_result[i].audio_path)

				const is_correct = question_result[i].result
				if (is_correct) {
					gsap.timeline().to(score_el, {
						scaleY: 0,
						duration: !fast_forward ? 0.25 : 0.1,
						onComplete: () => {score++}
					}).to(score_el, {
						scaleY: 1,
						duration: !fast_forward ? 0.25 : 0.1
					})
					gsap.to(review_words_el[i], {
						autoAlpha: 0,
						duration: !fast_forward ? 0.5 : 0.2
					})
					if (!fast_forward) await sound.play('extra-bonus')
					else sound.play('extra-bonus')
				} else {
					gsap.to(review_words_el, {
						autoAlpha: 0,
						duration: 0.6
					})
					gsap.timeline().to(review_words_el, {
						rotate: "-=30",
						duration: 0.15
					}).to(review_words_el, {
						rotate: "+=30",
						duration: 0.15
					}).to(review_words_el, {
						rotate: "-=15",
						duration: 0.15
					}).to(review_words_el, {
						rotate: "+=15",
						duration: 0.15
					})
					if (!fast_forward) await sound.play('wrong-electricity-buzz')
					else sound.play('wrong-electricity-buzz')
				}
				reviewed_word_count++
				if (reviewed_word_count < question_result.length) {
					reviewWords(reviewed_word_count)
				} else {
					onReviewWordComplete()
				}
			}
		})
	}

	const onReviewWordComplete = () => {
		hide_skip_button = true
		gsap.timeline().fromTo(alphabet_score_el, {
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
	}

	onMount(() => {
		gsap.set([alphabet_score_el, button_row_el, ...review_words_el], {
			autoAlpha: 0
		})
		gsap.timeline().fromTo(panel_el, {
			y: "+=100",
			scale: 0
		}, {
			scale: 1,
			y: "-=100",
			autoAlpha: 1,
			ease: "back.out",
			duration: 0.35,
			onComplete: () => {
				reviewWords(0)
			}
		})
	})

	const onBack = () => {
		const message = {
			type: 'exit'
		}
		window.postMessage(JSON.stringify(message))
		if (window.IS_WEB_VIEW) {
			window.ReactNativeWebView.postMessage(JSON.stringify(message))
		}
	}

	const onSkipClick = () => {
		sound.play('ball-tap')
		hide_skip_button = true
		fast_forward = true
	}
</script>

<div bind:this={panel_el} class="fixed z-50 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" style="min-width: 20em">
	<div class="relative z-10 flex justify-center -mb-6">
		<ScoreSVG color="#918CF0"/>
	</div>
	<div class="relative font-bold border-4 px-8 pt-12 pb-4 border-purple-500 text-center" style="border-radius: 3em; background: #DFDEF7">
		<div class="mb-4 relative h-20">
			{#each question_result as r, i}
				<div bind:this={review_words_el[i]} class="absolute inset-0 flex items-center justify-center">
					<Font word={r.word}/>
				</div>
			{/each}
			<div bind:this={alphabet_score_el}>
				<AlphabetScore score={derived_score}/>
			</div>
		</div>
		<div class="flex justify-center text-xl" bind:this={button_row_el}>
			{#if is_challenge_only}
				<button on:click={onBack} class="whitespace-nowrap bg-purple-700 border-purple-500 border-4 text-white px-8 whitespace-nowrap py-4 rounded-full font-bold ml-4" style="color: #F69CCA; background: #535AAB">{$t('quit')}</button>
			{:else}
				<button on:click={restartEasy} class="whitespace-nowrap bg-white text-purple-500 border-purple-500 border-2 px-8 py-4 rounded-full font-bold">{$t('practise_mode')}</button>
				<button on:click={restartNormal} class="whitespace-nowrap bg-purple-700 border-purple-500 border-4 text-white px-8 whitespace-nowrap py-4 rounded-full font-bold ml-4" style="color: #F69CCA; background: #535AAB">{$t('retry')}</button>
			{/if}
		</div>
		<div class="absolute top-8 right-4 flex items-center">
			<div bind:this={score_el} class="inline-flex">
				{#each String(score).split('') as s}
					<Alphabet char={s} height_class="h-8" text_color="white" stroke_color="#918CF0"/>
				{/each}
			</div>
			<Alphabet char="/" height_class="h-6" text_color="white" stroke_color="#918CF0"/>
			{#each String(total_score).split('') as s}
				<Alphabet char={s} height_class="h-8" text_color="white" stroke_color="#918CF0"/>
			{/each}
		</div>
		{#if !hide_skip_button}
			<button on:click={onSkipClick} class="absolute right-4 bottom-4 text-purple-500 font-bold text-xl">
				{$t('skip')}
			</button>
		{/if}
	</div>
</div>