<script>
	import {sound} from "../components/spelling/Sound";

	import Board from '../components/spelling/hard-mode-score-board.svelte'

	let started = false

	const question_result = [
		{
			word: "solar power",
			result: true,
			"audio_path": "https://ehla-media-bucket.s3.ap-southeast-1.amazonaws.com/ehlapolly/advanced/Amy-standard-47cf16cec79dedf889fefd2d4645737e-1624248816.mp3"
		},
		{
			word: "marine energy",
			result: true,
			"audio_path": "https://ehla-media-bucket.s3.ap-southeast-1.amazonaws.com/ehlapolly/advanced/Amy-standard-6f2b33e29bb23573ce3e0e8b859585ef-1624248816.mp3",
		},
		{
			word: "marine energy",
			result: true,
			"audio_path": "https://ehla-media-bucket.s3.ap-southeast-1.amazonaws.com/ehlapolly/advanced/Amy-standard-6f2b33e29bb23573ce3e0e8b859585ef-1624248816.mp3",
		},
		{
			word: "marine energy",
			result: true,
			"audio_path": "https://ehla-media-bucket.s3.ap-southeast-1.amazonaws.com/ehlapolly/advanced/Amy-standard-6f2b33e29bb23573ce3e0e8b859585ef-1624248816.mp3",
		},
		{
			word: "marine energy",
			result: true,
			"audio_path": "https://ehla-media-bucket.s3.ap-southeast-1.amazonaws.com/ehlapolly/advanced/Amy-standard-6f2b33e29bb23573ce3e0e8b859585ef-1624248816.mp3",
		},
		{
			word: "marine energy",
			result: true,
			"audio_path": "https://ehla-media-bucket.s3.ap-southeast-1.amazonaws.com/ehlapolly/advanced/Amy-standard-6f2b33e29bb23573ce3e0e8b859585ef-1624248816.mp3",
		},
		{
			word: "marine energy",
			result: true,
			"audio_path": "https://ehla-media-bucket.s3.ap-southeast-1.amazonaws.com/ehlapolly/advanced/Amy-standard-6f2b33e29bb23573ce3e0e8b859585ef-1624248816.mp3",
		},
		{
			word: "marine energy",
			result: true,
			"audio_path": "https://ehla-media-bucket.s3.ap-southeast-1.amazonaws.com/ehlapolly/advanced/Amy-standard-6f2b33e29bb23573ce3e0e8b859585ef-1624248816.mp3",
		},
		{
			word: "marine energy",
			result: true,
			"audio_path": "https://ehla-media-bucket.s3.ap-southeast-1.amazonaws.com/ehlapolly/advanced/Amy-standard-6f2b33e29bb23573ce3e0e8b859585ef-1624248816.mp3",
		},
		{
			word: "marine energy",
			result: true,
			"audio_path": "https://ehla-media-bucket.s3.ap-southeast-1.amazonaws.com/ehlapolly/advanced/Amy-standard-6f2b33e29bb23573ce3e0e8b859585ef-1624248816.mp3",
		},
		{
			word: "marine energy",
			result: true,
			"audio_path": "https://ehla-media-bucket.s3.ap-southeast-1.amazonaws.com/ehlapolly/advanced/Amy-standard-6f2b33e29bb23573ce3e0e8b859585ef-1624248816.mp3",
		},
		{
			word: "marine energy",
			result: true,
			"audio_path": "https://ehla-media-bucket.s3.ap-southeast-1.amazonaws.com/ehlapolly/advanced/Amy-standard-6f2b33e29bb23573ce3e0e8b859585ef-1624248816.mp3",
		},
		{
			word: "marine energy",
			result: true,
			"audio_path": "https://ehla-media-bucket.s3.ap-southeast-1.amazonaws.com/ehlapolly/advanced/Amy-standard-6f2b33e29bb23573ce3e0e8b859585ef-1624248816.mp3",
		}
	]

	const init = () => {
		const audio_sfx = ['tap', 'tap-2', 'stone-hit', 'collected-coin', 'magic-unlock', 'magic-unlock-2', 'boom', 'mechanical-crate-pick-up', 'bonus-earned', 'extra-bonus', 'treasure', 'flute-alert', 'negative-guitar-tone', 'bonus-extra', 'sci-fi-laser', 'flute-alert-short', 'ball-tap', 'game-coin-touch', 'treasure-coin', 'player-losing', 'health-recharge', 'game-bonus-reached', 'changing-tab', 'casino-notification', 'wrong-electricity-buzz']
		audio_sfx.forEach(key => {
			sound.load(key, `/sound/${key}.mp3`)
		})
		const all_phase_audios = question_result.map(p => p.audio_path)
		sound.loadBatch(all_phase_audios)
		setTimeout(() => {
			started = true
		}, 1000)
	}
</script>

<svelte:window on:touchstart={init}/>
<!--<Font word="start game"/>-->
{#if started}
	<Board {question_result}/>
{/if}
<a class="p-4 block hidden" href="/spelling"></a>
<a class="p-4 block" href="/spelling?testing=1">Start game</a>