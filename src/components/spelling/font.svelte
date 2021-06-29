<script>
	export let word

	$: words = word.split(' ')
	$: words_chars = words.map(w => w.split(''))

	import Alphabet from './alphabet.svelte'
</script>

<div class="flex">
	{#each words_chars as w, i}
		{#if i !== 0}
			<div class="w-2"></div>
		{/if}
		{#each w as char}
			<Alphabet height_class="h-10" {char}/>
		{/each}
	{/each}
</div>