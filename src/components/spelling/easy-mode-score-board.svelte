<script>
	export let heart_left
	export let coins

	import ScoreSVG from './score-svg.svelte'
	import AlphabetScore from './alphabet-score.svelte'
	import {createEventDispatcher, onMount} from 'svelte'
	import {sound} from "./Sound";
	import gsap from "gsap";
	const dispatch = createEventDispatcher()

	let panel_el
	let alphabet_score_el
	let button_row_el = []
	let heart_score_point_els = []
	let coin_score_point_els = []

	$: derived_score = Math.ceil(heart_left / 6 * 10)

	onMount(() => {
		gsap.set([alphabet_score_el, button_row_el], {
			autoAlpha: 0
		})
		const heart_points_el = heart_score_point_els.slice(0, heart_left)
		console.log('heart_points_el', heart_points_el)
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
		}).to(heart_points_el, {
			background: "#FCA5D1",
			duration: 0.1,
			stagger: {
				each: 0.1,
				onComplete: () => {
					sound.play('collected-coin')
				}
			}
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
	<div class="flex justify-center -mb-6">
		<ScoreSVG color="#ED7182"/>
	</div>
	<div class="font-bold border-4 px-8 pt-12 pb-4 border-red-500 text-center" style="border-radius: 3em; background: #FAFAFA">
		<div class="grid grid-cols-2 gap-4 mb-4">
			<div>
				<div bind:this={alphabet_score_el}>
					<AlphabetScore stroke_color="#ED7182" text_color="#FFF8E5" score={derived_score}/>
				</div>
			</div>
			<div>
				<div class="flex items-center mb-2">
					<div class="h-8 w-8 flex-shrink-0 items-center justify-center flex bg-center bg-contain bg-no-repeat" style="background-image: url('/image/spelling/heart.png')"></div>
					<div class="ml-2 flex">
						{#each [0,1,2,3,4,5] as i}
							<div bind:this={heart_score_point_els[i]} style="border-color: #F892C6" class="h-5 w-2.5 bg-white border-2 mx-0.5 rounded-sm"></div>
						{/each}
					</div>
				</div>
				<div class="flex items-center">
					<div class="h-8 w-8 flex-shrink-0 items-center justify-center flex bg-center bg-contain bg-no-repeat" style="background-image: url('/image/spelling/coin.png')"></div>
					<div class="ml-2 flex">
						{#each [0,1,2,3,4,5] as i}
							<div bind:this={coin_score_point_els[i]} style="border-color: #E7961A" class="h-5 w-2.5 bg-white border-2 mx-0.5 rounded-sm"></div>
						{/each}
					</div>
				</div>
			</div>
		</div>
		<div bind:this={button_row_el} class="grid gap-4 grid-cols-2 text-xl">
			<button on:click={() => {dispatch('restart-easy')}} class="bg-white text-red-500 border-red-500 border-2 px-8 py-4 rounded-full font-bold">再玩</button>
			<button on:click={() => {dispatch('restart-normal')}} class="bg-red-500 text-white px-4 py-4 rounded-full font-bold">下一關</button>
		</div>
	</div>
</div>