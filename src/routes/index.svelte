<script>
	import {sound} from "../components/spelling/Sound";

	let query = '?words=%5B%7B"id"%3A"47491"%2C"word"%3A"solar%20power"%2C"description"%3A"n.%20太陽能"%2C"description_alter"%3A"n.%20太陽能"%2C"audio_path"%3A"https%3A%2F%2Fehla-media-bucket.s3.ap-southeast-1.amazonaws.com%2Fehlapolly%2Fadvanced%2FAmy-standard-47cf16cec79dedf889fefd2d4645737e-1624248816.mp3"%2C"image_path"%3A"https%3A%2F%2Fehla-media-bucket.s3.amazonaws.com%2Fcms%2Faudios%2F202106%2F17%2Fsolarpower_1623903013650.jpg"%2C"subwords"%3A%5B%7B"word"%3A"solar"%2C"audio_path"%3A"https%3A%2F%2Fehla-media-bucket.s3.ap-southeast-1.amazonaws.com%2Fehlapolly%2Fadvanced%2FAmy-standard-e2cf1817f9bb7713307949ada414cb68-1610783221.mp3"%7D%2C%7B"word"%3A"power"%2C"audio_path"%3A"https%3A%2F%2Fehla-media-bucket.s3.amazonaws.com%2Fcms%2Faudios%2F202001%2F08%2F4237power_1578468563691.mp3"%7D%5D%7D%2C%7B"id"%3A"47492"%2C"word"%3A"marine%20energy"%2C"description"%3Anull%2C"description_alter"%3Anull%2C"audio_path"%3A"https%3A%2F%2Fehla-media-bucket.s3.ap-southeast-1.amazonaws.com%2Fehlapolly%2Fadvanced%2FAmy-standard-6f2b33e29bb23573ce3e0e8b859585ef-1624248816.mp3"%2C"image_path"%3A"https%3A%2F%2Fehla-media-bucket.s3.amazonaws.com%2Fcms%2Faudios%2F202106%2F17%2FMarineenergy_1623903168069.jpg"%2C"subwords"%3A%5B%7B"word"%3A"marine"%2C"audio_path"%3A"https%3A%2F%2Fehla-media-bucket.s3.amazonaws.com%2Fword_audio_20190429%2Fmarine-1562309062391.mp3"%7D%2C%7B"word"%3A"energy"%2C"audio_path"%3A"https%3A%2F%2Fehla-media-bucket.s3.amazonaws.com%2Fword_audio_20190429%2Fenergy-1557471587892.mp3"%7D%5D%7D%5D'
	import Font from '../components/spelling/font.svelte'
	import Board from '../components/spelling/hard-mode-score-board.svelte'

	let started = false

	let test = [
		{
			"id": "47491",
			"word": "Don't",
			"description": "n. 太陽能",
			"description_alter": "n. 太陽能",
			"audio_path": "https://ehla-media-bucket.s3.ap-southeast-1.amazonaws.com/ehlapolly/advanced/Amy-standard-47cf16cec79dedf889fefd2d4645737e-1624248816.mp3",
			"image_path": "https://ehla-media-bucket.s3.amazonaws.com/cms/audios/202106/17/solarpower_1623903013650.jpg"
		}
	]

	query = encodeURIComponent(JSON.stringify(test))

	const question_result = [
		{
			word: "solar power",
			result: true,
			"audio_path": "https://ehla-media-bucket.s3.ap-southeast-1.amazonaws.com/ehlapolly/advanced/Amy-standard-47cf16cec79dedf889fefd2d4645737e-1624248816.mp3"
		},
		{
			word: "marine energy",
			result: false,
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
<a class="p-4 block" href="/spelling?words={query}">Start game</a>