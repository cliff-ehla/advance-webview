<script>
	import Alphabet from './alphabet.svelte'
	export let score
	export let text_color = '#FFF8E5'
	export let stroke_color = '#918CF0'
</script>

<div class="flex justify-center">
	{#if score === 10}
		<Alphabet {text_color} {stroke_color} height_class="h-24" char="A"/>
		<Alphabet {text_color} {stroke_color} height_class="h-24 -mt-2" char="+"/>
	{:else if score === 9}
		<Alphabet {text_color} {stroke_color} height_class="h-24" char="A"/>
	{:else if score === 8}
		<Alphabet {text_color} {stroke_color} height_class="h-24" char="A"/>
		<Alphabet {text_color} {stroke_color} height_class="h-24 -mt-2" char="-"/>
	{:else if score === 7}
		<Alphabet {text_color} {stroke_color} height_class="h-24" char="B"/>
		<Alphabet {text_color} {stroke_color} height_class="h-24 -mt-2" char="+"/>
	{:else if score === 6}
		<Alphabet {text_color} {stroke_color} height_class="h-24" char="B"/>
	{:else if score === 5}
		<Alphabet {text_color} {stroke_color} height_class="h-24" char="B"/>
		<Alphabet {text_color} {stroke_color} height_class="h-24 -mt-2" char="-"/>
	{:else if score === 4}
		<Alphabet {text_color} {stroke_color} height_class="h-24" char="C"/>
		<Alphabet {text_color} {stroke_color} height_class="h-24 -mt-2" char="+"/>
	{:else if score === 3}
		<Alphabet {text_color} {stroke_color} height_class="h-24" char="C"/>
	{:else if score === 2}
		<Alphabet {text_color} {stroke_color} height_class="h-24" char="C"/>
		<Alphabet {text_color} {stroke_color} height_class="h-24 -mt-2" char="-"/>
	{:else if score <= 1}
		<Alphabet {text_color} {stroke_color} height_class="h-24" char="D"/>
	{/if}
</div>