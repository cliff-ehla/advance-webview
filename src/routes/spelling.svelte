<script>
	import SpellGameBar from '../components/spelling/spell-game-bar.svelte'
	import {onMount} from 'svelte'

	let data = [{
		"id": "47491",
		"word": "solar power",
		"description": "n. 太陽能",
		"description_alter": "n. 太陽能",
		"audio_path": "https://ehla-media-bucket.s3.ap-southeast-1.amazonaws.com/ehlapolly/advanced/Amy-standard-47cf16cec79dedf889fefd2d4645737e-1624248816.mp3",
		"image_path": "https://ehla-media-bucket.s3.amazonaws.com/cms/audios/202106/17/solarpower_1623903013650.jpg",
		"subwords": [{
			"word": "solar",
			"audio_path": "https://ehla-media-bucket.s3.ap-southeast-1.amazonaws.com/ehlapolly/advanced/Amy-standard-e2cf1817f9bb7713307949ada414cb68-1610783221.mp3"
		},
			{
				"word": "power",
				"audio_path": "https://ehla-media-bucket.s3.amazonaws.com/cms/audios/202001/08/4237power_1578468563691.mp3"
			}
		]
	},
		{
			"id": "47492",
			"word": "marine energy",
			"description": null,
			"description_alter": null,
			"audio_path": "https://ehla-media-bucket.s3.ap-southeast-1.amazonaws.com/ehlapolly/advanced/Amy-standard-6f2b33e29bb23573ce3e0e8b859585ef-1624248816.mp3",
			"image_path": "https://ehla-media-bucket.s3.amazonaws.com/cms/audios/202106/17/Marineenergy_1623903168069.jpg",
			"subwords": [{
				"word": "marine",
				"audio_path": "https://ehla-media-bucket.s3.amazonaws.com/word_audio_20190429/marine-1562309062391.mp3"
			},
				{
					"word": "energy",
					"audio_path": "https://ehla-media-bucket.s3.amazonaws.com/word_audio_20190429/energy-1557471587892.mp3"
				}
			]
		}
	]

	let start = false

	const convert = () => {
		data.forEach(v => {
			v.phase = v.word
			v.phase_audio = v.audio_path
			v.subwords.forEach(s => {
				s.audio = s.audio_path
			})
			v.words = v.subwords.map(s => ({
				audio: s.audio_path,
				word: s.word
			}))
		})
		console.log(data)
	}

	onMount(convert)
</script>

<svelte:window on:click={() => start = true} on:touchstart={() => start = true}/>
{#if start}
	<SpellGameBar phases={data} mode="normal"/>
{:else}
	<div class="w-screen h-screen flex items-center justify-center">
		<div class="text-center">
			<p class="text-gray-400">Spelling game sample:</p>
			<p>Touch the screen to start</p>
		</div>
	</div>
{/if}

