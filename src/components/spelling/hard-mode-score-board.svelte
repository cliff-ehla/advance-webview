<script>
	import gsap from 'gsap'
	import {sound} from './Sound'
	import {createEventDispatcher, onMount} from 'svelte'
	import ScoreSVG from './score-svg.svelte'
	const dispatch = createEventDispatcher()

	let panel_el

	onMount(() => {
		sound.play('bonus-extra')
		gsap.fromTo(panel_el, {
			y: "+=100",
			scale: 0
		}, {
			scale: 1,
			y: "-=100",
			autoAlpha: 1,
			ease: "back.out",
			duration: 0.35
		})
	})
</script>

<div bind:this={panel_el} class="fixed z-50 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
	<div class="relative z-10 flex justify-center -mb-6">
		<ScoreSVG color="#918CF0"/>
	</div>
	<div class="relative font-bold border-4 px-8 pt-12 pb-4 border-purple-500 text-center" style="border-radius: 3em; background: #FAFAFA">
		<div class="mb-4">
			<img class="h-20 mx-auto" src="/image/spelling/B+.png" alt="heart">
		</div>
		<div class="grid gap-4 grid-cols-2 text-xl">
			<button on:click={() => {dispatch('restart-easy')}} class="bg-white text-purple-500 border-purple-500 border-2 px-8 py-4 rounded-full font-bold">訓練</button>
			<button on:click={() => {dispatch('restart-normal')}} class="bg-purple-700 border-purple-500 border-4 text-white px-8 whitespace-nowrap py-4 rounded-full font-bold" style="color: #F69CCA; background: #535AAB">再挑戰</button>
		</div>
		<div class="absolute top-4 right-2">
			5/6
		</div>
	</div>
</div>