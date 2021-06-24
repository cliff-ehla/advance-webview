<script>
	import SpellGameBar from '../components/spelling/spell-game-bar.svelte'

	let data = [
		{
			phase: 'egg',
			phase_audio: 'https://ehla-media-bucket.s3.amazonaws.com/cms/audios/201907/egg_1563517563909.mp3',
			word_audios: [
				'https://ehla-media-bucket.s3.amazonaws.com/cms/audios/201907/egg_1563517563909.mp3'
			]
		},
		{
			phase: 'bird',
			phase_audio: 'https://ehla-media-bucket.s3.amazonaws.com/word_audio_20180201/bird-1548034645943.mp3',
			word_audios: [
				'https://ehla-media-bucket.s3.amazonaws.com/word_audio_20180201/bird-1548034645943.mp3'
			]
		},
		{
			phase: 'leg',
			phase_audio: 'https://ehla-media-bucket.s3.amazonaws.com/cms/audios/202001/31/leg_1580453536370.mp3',
			word_audios: [
				'https://ehla-media-bucket.s3.amazonaws.com/cms/audios/202001/31/leg_1580453536370.mp3'
			]
		},
		{
			phase: 'middle school',
			phase_audio: 'https://ehla-media-bucket.s3.amazonaws.com/cms/audios/vocab/middle+school.mp3',
			word_audios: [
				'https://ehla-media-bucket.s3.amazonaws.com/audios/wordaudio-1480586389894-middle-14805863893639.mp3',
				'https://ehla-media-bucket.s3.amazonaws.com/word_audio_20190429/school-1558594856543.mp3'
			]
		},
		{
			phase: 'dragon boat races',
			phase_audio: 'https://ehla-media-bucket.s3.amazonaws.com/cms/audios/202012/25/dragonboatraces_1608891252743.mp3',
			word_audios: [
				'https://ehla-media-bucket.s3.amazonaws.com/word_audio_20190429/dragon-1562726540995.mp3',
				'https://ehla-media-bucket.s3.amazonaws.com/audios/wordaudio-1490087871940-boat.mp3',
				'https://ehla-media-bucket.s3.amazonaws.com/cms/audios/202001/31/race_1580451305925.mp3'
			]
		},
		{
			phase: 'departure lounge',
			phase_audio: 'https://ehla-media-bucket.s3.amazonaws.com/ehlapolly/37/973/Amy-standard-6923ba8a95379f0ca94c26253809ba08-1616378696.mp3',
			word_audios: [
				'https://ehla-media-bucket.s3.amazonaws.com/cms/audios/202001/23/departure_1579764413309.mp3',
				'https://ehla-media-bucket.s3.amazonaws.com/cms/audios/201912/12/lounge_1576140323303.mp3',
			]
		},
		{
			phase: 'hydroelectricity',
			phase_audio: 'https://ehla-media-bucket.s3.amazonaws.com/cms/dictation_audio_201102/20201120/hydroelectricity.mp3',
			word_audios: [
				'https://ehla-media-bucket.s3.amazonaws.com/cms/dictation_audio_201102/20201120/hydroelectricity.mp3'
			]
		}
	]

	let start = false

	$: phases = data.map(obj => {
		let words = obj.phase.split(' ')
		words = words.map((w,i) => ({
			word: w,
			audio: obj.word_audios[i]
		}))
		return {
			phase: obj.phase,
			phase_audio: obj.phase_audio,
			words
		}
	})
</script>

<svelte:window on:click={() => start = true} on:touchstart={() => start = true}/>
{#if start}
	<SpellGameBar {phases} hp_count={4} mode="normal"/>
{/if}

