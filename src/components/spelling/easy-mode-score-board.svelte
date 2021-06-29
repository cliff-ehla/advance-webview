<script>
	import ScoreSVG from './score-svg.svelte'
	import {createEventDispatcher} from 'svelte'
	const dispatch = createEventDispatcher()
	const onAgain = () => dispatch('restart-easy')
	const onNext = () => dispatch('restart-normal')
</script>

<div class="fixed z-50 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
	<div class="flex justify-center -mb-6">
		<ScoreSVG color="#918CF0"/>
	</div>
	<div class="font-bold border-4 px-8 pt-12 pb-4 border-red-500 text-center" style="border-radius: 3em; background: #FAFAFA">
		<div class="grid grid-cols-2 gap-4 mb-4">
			<div>
				<img src="/image/spelling/B+.png" alt="heart">
			</div>
			<div>
				<div class="flex items-center mb-2">
					<div class="h-8 w-8 flex-shrink-0 items-center justify-center flex bg-center bg-contain bg-no-repeat" style="background-image: url('/image/spelling/heart.png')"></div>
					<div class="ml-2 flex">
						{#each [1,2,3,4,5,6] as i}
							<div style="border-color: #F892C6" class="h-5 w-2.5 bg-white border-2 mx-0.5 rounded-sm"></div>
						{/each}
					</div>
				</div>
				<div class="flex items-center">
					<div class="h-8 w-8 flex-shrink-0 items-center justify-center flex bg-center bg-contain bg-no-repeat" style="background-image: url('/image/spelling/coin.png')"></div>
					<div class="ml-2 flex">
						{#each [1,2,3,4,5,6] as i}
							<div style="border-color: #E7961A" class="h-5 w-2.5 bg-white border-2 mx-0.5 rounded-sm"></div>
						{/each}
					</div>
				</div>
			</div>
		</div>
		<div class="grid gap-4 grid-cols-2 text-xl">
			<button on:click={() => {dispatch('restart-easy')}} class="bg-white text-red-500 border-red-500 border-2 px-8 py-4 rounded-full font-bold">再玩</button>
			<button on:click={() => {dispatch('restart-normal')}} class="bg-red-500 text-white px-4 py-4 rounded-full font-bold">下一關</button>
		</div>
	</div>
</div>