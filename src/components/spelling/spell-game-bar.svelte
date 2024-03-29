<script>
	import {t} from 'svelte-i18n'
	import {onMount, setContext, createEventDispatcher} from 'svelte'
	import gsap from 'gsap'
	import Icon from '../icon.svelte'
	import {sound} from "./Sound";
	import SpellMaster from './spell-master.svelte'
	import EasyModeScoreBoard from './easy-mode-score-board.svelte'
	import HardModeScoreBoard from './hard-mode-score-board.svelte'
	import GameOverDialog from './gameover-dialog.svelte'
	import Alphabet from './alphabet.svelte'

	export let mode
	export let is_challenge_only = false
	export let hp_count = 6
	export let phases
	const question_count = phases.length
	const dispatch = createEventDispatcher()

	$: total_words_count = phases.reduce((a,c) => a += c.words.length, 0)
	$: total_char_count = phases.reduce((a,c) => {
		let words = c.words.map(w => w.word)
		let total_char = 0
		words.forEach(w => {
			total_char += w.length
		})
		return a += total_char
	}, 0)

	// save the status
	let hp = hp_count
	let question_result = []
	let combo = 0
	let max_combo = 0
	let word_progress = 0
	let game_ended = false
	let game_overed = false // only in easy mode

	// dom
	let heart_els = []
	let star_els = []
	let star_holder_els = []
	let star_broken_els = []
	let dialog_el
	let dialog_backdrop_el
	let combo_score_el

	const setCheckpointActive = (i, cb) => {
		if (!cb) cb = () => {}
		sound.play('bonus-earned')
		const el = [star_els[i], star_holder_els[i]]
		gsap.timeline().fromTo(el, {
			scale: 0
		}, {
			scale: 1,
			duration: 0.3,
			onComplete: cb
		}).to(el, {
			rotate: 360,
			repeat: -1,
			duration: 4,
			ease: "none"
		})
	}

	const setCheckpointDanger = i => {
		const el = [star_els[i], star_holder_els[i]]
		gsap.timeline().to(el, {
			x: "+=20",
			duration: 0.1
		}).to(el, {
			x: "-=20",
			duration: 0.1
		}).to(el, {
			x: "+=10",
			duration: 0.1
		}).to(el, {
			x: "-=10",
			duration: 0.1
		})
		gsap.timeline().to(el, {
			opacity: 0,
			duration: .3,
			repeat: -1,
			yoyo: true
		})
	}

	const saveResult = (i, is_correct) => {
		let obj = phases[i]
		obj.result = is_correct
		question_result[i] = obj
		console.log('saveResult', question_result)
	}

	const setCheckpointSuccess = (i, cb) => {
		saveResult(i, true)
		sound.play('treasure')
		gsap.killTweensOf([star_els[i], star_holder_els[i]])
		gsap.set(star_holder_els[i], {autoAlpha: 0})
		gsap.set(star_els[i], {
			rotate: 0,
			opacity: 1
		})
		const star = star_els[i]
		gsap.timeline().to(star, {
			rotate: 720,
			scale: 0.3,
			duration: 0.5
		}).to(star, {
			scale: 2,
			duration: 0.5,
		}).to(star, {
			scale: 1,
			duration: 0.3,
			onComplete: cb
		})
	}

	const setCheckpointFail = i => {
		saveResult(i, false)
		sound.play('negative-guitar-tone')
		gsap.killTweensOf([star_els[i], star_holder_els[i]])
		gsap.set(star_holder_els[i], {
			rotate: 0,
			autoAlpha: 0
		})
		gsap.set(star_broken_els[i], {
			autoAlpha: 1
		})
		const star = star_els[i]
		gsap.to(star, {
			y: `+=200`,
			opacity: 0,
			duration: 2,
			ease: "Back.in"
		})
	}

	const lessHeart = (cb) => {
		if (!cb) cb = () => {}
		let el = heart_els[hp - 1]
		gsap.timeline().to(el, {
			x: "+=20",
			rotate: "+=45",
			duration: 0.1
		}).to(el, {
			x: "-=20",
			rotate: "-=45",
			duration: 0.1
		}).to(el, {
			x: "+=10",
			rotate: "+=30",
			duration: 0.1
		}).to(el, {
			x: "-=10",
			rotate: "-=30",
			duration: 0.1
		}).to(el, {
			y: "+=200",
			scaleX: 5,
			scaleY: 5,
			rotate: 360,
			autoAlpha: 0,
			duration: 1.5,
			onComplete: cb
		}).to(el, {
			scaleX: 1,
			scaleY: 1,
			rotate: 0,
		})
		hp--
	}

	const addHeart = () => {
		if (hp === 6) return
		console.log('addHeart')
		sound.play('health-recharge')
		let el = heart_els[hp]
		gsap.timeline().to(el, {
			autoAlpha: 1,
			yoyo: true,
			repeat: 6,
			duration: 0.15
		})
		gsap.to(el, {
			y: "-=200",
			duration: 0.9
		})
		hp++
	}

	const addCombo = (count) => {
		sound.play('collected-coin')
		max_combo = Math.max(combo, max_combo)
		gsap.timeline().to(combo_score_el, {
			scaleY: 0,
			duration: 0.2,
			onComplete: () => {
				combo += count
			}
		}).to(combo_score_el, {
			scaleY: 1,
			duration: 0.2
		})
	}

	const endCombo = () => {
		max_combo = Math.max(combo, max_combo)
		combo = 0
	}

	const addProgress = () => {
		word_progress++
	}

	setContext('spell-game-bar', {
		setCheckpointActive,
		setCheckpointDanger,
		setCheckpointFail,
		setCheckpointSuccess,
		addHeart,
		lessHeart,
		addProgress,
		addCombo,
		endCombo
	})

	onMount(() => {
		gsap.set(star_els, {scale: 0})
		gsap.set(star_broken_els, {
			autoAlpha: 0
		})
		gsap.set([dialog_backdrop_el, dialog_el], {
			autoAlpha: 0
		})
	})

	const onPauseClick = () => {
		showExitDialog()
	}

	const showExitDialog = () => {
		sound.play('changing-tab')
		gsap.to(dialog_backdrop_el, {
			autoAlpha: 0.6,
			duration: 0.5
		})
		gsap.fromTo(dialog_el, {
			y: "+=100",
			scale: 0
		}, {
			scale: 1,
			y: "-=100",
			autoAlpha: 1,
			ease: "back.out",
			duration: 0.35
		})
	}

	const closeExitDialog = () => {
		sound.play('changing-tab')
		gsap.to(dialog_backdrop_el, {
			autoAlpha: 0,
			duration: 0.25
		})
		gsap.to(dialog_el, {
			scale: 0,
			autoAlpha: 0,
			duration: 0.25
		})
	}

	const confirmExit = () => {
		sound.play('casino-notification')
		dispatch('exit')
	}

	const onGameEnd = () => {
		game_ended = true
		const message = {
			type: 'result',
			data: question_result
		}
		window.postMessage(JSON.stringify(message))
		if (window.IS_WEB_VIEW) {
			try {
				window.ReactNativeWebView.postMessage(JSON.stringify(message))
			} catch (e) {}
		}
	}

	const onGameOver = () => {
		game_overed = true

	}
</script>

<div bind:this={dialog_el} class="fixed z-50 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
	<div class="font-bold bg-white border-4 p-12 border-red-500 text-center" style="border-radius: 3em">
		<p class="mb-6 text-2xl">{$t('quit?')}</p>
		<div class="flex">
			<button on:click={closeExitDialog} class="bg-white text-red-500 border-red-500 border-4 px-8 py-2 rounded-full uppercase">{$t('no')}</button>
			<button on:click={confirmExit} class="bg-red-500 text-white px-8 py-2 rounded-full ml-4 uppercase">{$t('yes')}</button>
		</div>
	</div>
</div>

<div bind:this={dialog_backdrop_el} class="fixed z-40 inset-0 bg-black flex items-center justify-center"></div>

<div class="bg-purple-700 relative z-30 h-screen" style="background: {mode === 'easy' ? '#59B7FF' : '#3A34AB'}">
	<div class="z-50 relative w-full flex items-center justify-around px-2" style="height: 4em;">
		<div class="w-48 flex items-center">
			<div on:click={onPauseClick} class="cursor-pointer w-10 h-10 rounded-full bg-white bg-opacity-30 flex justify-center items-center text-white">
				<Icon name="pause"/>
			</div>
			{#if mode === 'easy'}
				<div class="ml-4 inline-flex items-center">
					<img class="h-10" src="/image/spelling/arrow.png" alt="coin">
					<div class="flex" bind:this={combo_score_el}>
						{#each String(combo).split('') as char}
							<div class="-mx-0.5">
								<Alphabet {char} height_class="h-8" stroke_color="#59B7FF" text_color="#FAFF00"/>
							</div>
						{/each}
					</div>
				</div>
			{/if}
		</div>
		<div class="flex-1">
			<div class="flex justify-center items-center">
				{#if mode === 'normal'}
					{#each [...Array(question_count).keys()] as p, i}
						<div class="relative w-8 mx-1">
							<img bind:this={star_broken_els[i]} src="/image/spelling/star-broken.png" alt="placeholder" class="absolute top-0 left-0">
							<img bind:this={star_holder_els[i]} src="/image/spelling/star-placeholder.png" alt="placeholder">
							<img bind:this={star_els[i]} src="/image/spelling/star.png" alt="placeholder" class="absolute top-0 left-0">
						</div>
					{/each}
				{:else if mode === 'easy'}
					<div class="w-full h-2 rounded-full relative" style="background: #5775C2;">
						<div class="absolute left-0 inset-y-0 rounded-full transition-all" style="width: {word_progress / total_words_count * 100}%; background: #FFB8DC"></div>
					</div>
				{/if}
			</div>
		</div>
		<div class="w-48 flex justify-end">
			{#if mode === 'easy'}
				{#each [...Array(hp_count).keys()] as i}
					<div class="w-4 relative">
						{#if i % 2 === 0}
							<img src="/image/spelling/heart-placeholder-left.png" alt="heart">
							<img class="absolute inset-0 text-red-500" src="/image/spelling/heart-left.png" alt="heart" bind:this={heart_els[i]}>
						{:else}
							<img src="/image/spelling/heart-placeholder-right.png" alt="heart">
							<img class="absolute inset-0 text-red-500" src="/image/spelling/heart-right.png" alt="heart" bind:this={heart_els[i]}>
						{/if}
					</div>
					{#if i % 2 === 1}
						<div class="w-1"></div>
					{/if}
				{/each}
			{/if}
		</div>
	</div>
	<div class="relative z-10">
		{#if game_ended}
			{#if mode === 'easy'}
				<EasyModeScoreBoard heart_left={hp} {max_combo} {total_char_count} on:restart-easy on:restart-normal/>
			{:else if mode === 'normal'}
				<HardModeScoreBoard {question_result} on:restart-easy on:restart-normal {is_challenge_only}/>
			{/if}
		{:else if game_overed}
			<GameOverDialog on:restart-easy/>
		{:else}
			<SpellMaster on:game-over={onGameOver} on:game-end={onGameEnd} {phases} {hp} {mode} {question_result}/>
		{/if}
	</div>

	<svg class="absolute bottom-0 inset-x-0" viewBox="0 0 667 202" fill="none" xmlns="http://www.w3.org/2000/svg">
		<ellipse cx="-47" cy="210.5" rx="340" ry="210.5" fill="{mode === 'easy' ? '#A6D895' : '#606BD6'}"/>
		<ellipse cx="530.5" cy="262.5" rx="501.5" ry="229.5" fill="{mode === 'easy' ? '#A6D895' : '#424DB8'}"/>
		<ellipse cx="147.5" cy="315.5" rx="501.5" ry="229.5" fill="{mode === 'easy' ? '#98CB87' : '#38549A'}"/>
	</svg>
</div>
