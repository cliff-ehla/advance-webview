<script>
	import Alphabet from './alphabet.svelte'
	export let score
	export let text_color = '#FFF8E5'
	export let stroke_color = '#918CF0'
</script>

<div class="flex justify-center">
	<Alphabet {text_color} {stroke_color} height_class="h-24" char="B"/>
	<Alphabet {text_color} {stroke_color} height_class="h-24 -mt-2" char="+"/>
</div>