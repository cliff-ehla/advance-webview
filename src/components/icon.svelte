<script>
	export let name
</script>

{#if name === 'heart'}
	<svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" viewBox="0 0 36 36" class="fill-current w-4"><path d="M28.598 1.68C24.594.976 21.298 4.273 18 7.57 14.703 4.27 11.406.974 7.402 1.68S-1.31 7.1.338 13.22C1.986 19.345 9.992 26.88 18 34.417c8.008-7.535 16.014-15.072 17.662-21.195 1.65-6.122-3.06-10.833-7.064-11.54z"></path></svg>
{:else if name === 'pause'}
	<svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" viewBox="0 0 36 36" class="fill-current w-4"><path d="M4 0h8v36H4V0zm20 0h8v36h-8V0z"></path></svg>
{/if}
