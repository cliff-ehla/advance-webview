<script>
	import SpellGameBar from '../components/spelling/spell-game-bar.svelte'
	import {onMount} from 'svelte'
	import {sound} from "../components/spelling/Sound";

	let phases = [{
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

	let loaded = false
	let selected_mode

	const convertData = () => {
		phases.forEach(v => {
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
	}

	const loadAudio = async () => {
		const all_phase_audios = phases.map(p => p.phase_audio).filter(v => !!v)
		const all_word = phases.map(p => p.words.map(w => w.word)).reduce((a,b) => [...a, ...b], []).filter(a => !!a)
		let all_chars = Array.from(new Set(all_word.map(w => w.toLowerCase()).join().split(''))).sort()
		all_chars = all_chars.filter(c => /^[a-zA-Z()]+$/.test(c))
		all_chars.forEach(char => {
			sound.load(char, `https://ehla-media-bucket.s3-ap-southeast-1.amazonaws.com/baby/sounds/alphabets/${char}.mp3`)
		})
		let all_audios = phases.map(p => p.words.map(w => w.audio)).reduce((a,b) => [...a, ...b], []).filter(a => !!a)
		all_audios = [...all_audios, ...all_phase_audios]
		const audio_sfx = ['tap', 'tap-2', 'stone-hit', 'collected-coin', 'magic-unlock', 'magic-unlock-2', 'boom', 'mechanical-crate-pick-up', 'bonus-earned', 'extra-bonus', 'treasure', 'flute-alert', 'negative-guitar-tone', 'bonus-extra', 'sci-fi-laser', 'flute-alert-short', 'ball-tap', 'game-coin-touch', 'treasure-coin', 'player-losing', 'health-recharge', 'game-bonus-reached']
		audio_sfx.forEach(key => {
			sound.load(key, `/sound/${key}.mp3`)
		})
		await sound.loadBatch(all_audios)
	}

	onMount(async () => {
		convertData()
		await loadAudio()
		loaded = true
	})
</script>

{#if selected_mode}
	<SpellGameBar phases={phases} mode={selected_mode}/>
{:else}
	<div class="relative w-screen h-screen flex items-center justify-center px-12" style="background-image: linear-gradient(#FDFFE8,#FBFFCA)">
		<div class="relative z-10 grid gap-8 grid-cols-2">
			<div on:touchstart={() => {selected_mode = 'easy'}} class="relative flex justify-center">
				<img src="image/spelling/easy-card.png" alt="card" class="w-64 transform -rotate-6">
				<img src="image/spelling/easy-button.png" alt="card" class="absolute -bottom-4 left-1/2 w-32 -ml-12">
			</div>
			<div on:touchstart={() => {selected_mode = 'hard'}} class="relative flex justify-center">
				<img src="image/spelling/hard-card.png" alt="card" class="w-64 transform rotate-6">
				<img src="image/spelling/hard-button.png" alt="card" class="absolute -bottom-4 left-1/2 w-32 -ml-20">
			</div>
		</div>
		<svg class="absolute bottom-0 inset-x-0" viewBox="0 0 667 375" fill="none" xmlns="http://www.w3.org/2000/svg">
			<ellipse cx="152.5" cy="387.5" rx="365.5" ry="323.5" fill="#F0F4C5"/>
			<ellipse cx="634.5" cy="315.5" rx="365.5" ry="323.5" fill="#F5F8D8"/>
			<ellipse cx="585.5" cy="387.5" rx="365.5" ry="323.5" fill="#FDFFE8"/>
			<ellipse cx="575" cy="373" rx="332" ry="186" fill="#F0F4C4"/>
			<ellipse cx="23" cy="387" rx="199" ry="194" fill="#F7FFA2"/>
		</svg>
	</div>
{/if}

