<script>
	import {onMount, setContext} from 'svelte'
	import gsap from 'gsap'
	import Icon from './icon.svelte'
	import {sound} from "./core/Sound";
	import SpellMaster from './spell-master.svelte'

	export let mode
	export let hp_count
	export let phases
	const question_count = phases.length

	// save the status
	let hp = hp_count
	let question_result = []

	// dom
	let heart_els = []
	let star_els = []
	let star_holder_els = []
	let star_broken_els = []

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

	const setCheckpointSuccess = (i, cb) => {
		console.log('setCheckpointSuccess')
		question_result[i] = true
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
			duration: 1,
		}).to(star, {
			scale: 1,
			duration: 0.8,
			onComplete: cb
		})
	}

	const setCheckpointFail = i => {
		question_result[i] = false
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
		gsap.to(heart_els[hp - 1], {
			y: window.innerHeight / 2,
			x: -window.innerWidth / 2,
			scaleX: 5,
			scaleY: 5,
			rotate: 360,
			autoAlpha: 0,
			duration: 1.5,
			onComplete: cb
		})
		hp--
	}

	const addHeart = () => {

	}

	setContext('spell-game-bar', {
		setCheckpointActive,
		setCheckpointDanger,
		setCheckpointFail,
		setCheckpointSuccess,
		addHeart,
		lessHeart
	})

	onMount(() => {
		gsap.set(star_els, {scale: 0})
		gsap.set(star_broken_els, {
			autoAlpha: 0
		})
	})
</script>

<div class="bg-purple-700 relative h-screen" style="background: #3A34AB">
	<div class="z-50 relative w-full flex items-center justify-around px-2" style="height: 4em;">
		<div class="w-28">
			<div class="w-10 h-10 rounded-full bg-white bg-opacity-30 flex justify-center items-center text-white">
				<Icon name="pause"/>
			</div>
		</div>
		<div class="flex-1">
			<div class="flex justify-center items-center">
				{#each [...Array(question_count).keys()] as p, i}
					<div class="relative w-8 mx-1">
						<img bind:this={star_broken_els[i]} src="/star-broken.png" alt="placeholder" class="absolute top-0 left-0">
						<img bind:this={star_holder_els[i]} src="/star-placeholder.png" alt="placeholder">
						<img bind:this={star_els[i]} src="/star.png" alt="placeholder" class="absolute top-0 left-0">
					</div>
				{/each}
			</div>
		</div>
		<div class="w-28 flex justify-end">
			{#if mode === 'easy'}
				{#each [...Array(hp_count).keys()] as i}
					<div class="mx-1 text-red-500 relative">
						<div class="text-blue-700">
							<Icon name="heart"/>
						</div>
						<div class="absolute inset-0 text-red-500" bind:this={heart_els[i]}>
							<Icon name="heart"/>
						</div>
					</div>
				{/each}
			{/if}
		</div>
	</div>
	<div class="relative z-10">
		<SpellMaster {phases} {hp} {question_result}/>
	</div>

	<svg class="absolute bottom-0 inset-x-0" viewBox="0 0 667 202" fill="none" xmlns="http://www.w3.org/2000/svg">
		<ellipse cx="-47" cy="210.5" rx="340" ry="210.5" fill="#606BD6"/>
		<ellipse cx="530.5" cy="262.5" rx="501.5" ry="229.5" fill="#424DB8"/>
		<ellipse cx="147.5" cy="315.5" rx="501.5" ry="229.5" fill="#38549A"/>
	</svg>
</div>
