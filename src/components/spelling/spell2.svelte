<script>
	import {onMount, tick, createEventDispatcher, getContext} from 'svelte'
	import {shuffle, pickRandom} from "./utils";
	import {getDiff, getDiff2} from "./utils";
	import gsap from "gsap";
	import Alphabet from './alphabet.svelte'
	import {sound} from "./Sound";

	export let words
	export let phase_audio
	export let hp
	export let phase_idx
	export let mode

	const {lessHeart, addHeart, setCheckpointActive, setCheckpointDanger, setCheckpointFail, setCheckpointSuccess, addProgress, addCombo, endCombo} = getContext('spell-game-bar')
	const dispatch  = createEventDispatcher()
	let words_2 = []
	const MAX_STAGE_CHARS = 5
	let stage_char_box_els = []
	let char_els = [[], [], [], [], [], [], [], [], [], []]
	let watermark_char_els = [[], [], [], [], [], [], [], [], [], []]
	let chain_els = [[], [], [], [], [], [], [], [], [], []]
	let bench_holder_els = [[], [], [], [], [], [], [], [], [], []]
	let chain_link_els = []
	let word_index = 0
	let char_index = 0
	let chain_char_width
	let user_know_how_to_backspace = false
	let chain_broken = false

	const moveCharTo = (el, target_el, cb) => {
		const {x, y} = getDiff2(el, target_el)
		const params = {
			x: `+=${x}`,
			y: `+=${y}`,
			duration: .3
		}
		if (cb) params.onComplete = cb
		gsap.to(el, params)
	}

	const onCharClick = e => {
		const location = e.target.getAttribute("data-location")
		const verified = e.target.getAttribute("data-verified")

		if (location === 'stage') {
			moveToChain(e.target, async () => {
				if (mode === 'easy') {
					if (getToBeVerifyCharCount() === getStepLength()) {
						const is_correct = verifyToBeVerifyWord()
						if (is_correct) {
							completeSteps()
							await tick()
							if (getStepLength() === 0) {
								// when the word (or phase) is finished
								if (word_index < words_2.length - 1) {
									addHeart()
									addProgress()
									nextWord(highlightSteps)
								} else {
									addHeart()
									addProgress()
									sound.play('treasure')
									nextPhase()
								}
							} else {
								// when the required steps are finished
								highlightSteps()
								prepareStage()
							}
						} else {
							lessHeart()
							endCombo()
							if (hp === 1) {
								dispatch('game-over')
							} else {
								moveChainCharsToStage(getToBeVerifyChars(), () => {
									word_introduction(word_index)
								})
							}
						}
					}
				} else if (mode === 'normal') {
					addNextBenchCharToStage()
					if (isAllCharAnimatedToStage()) {
						const is_correct = verifyWord()
						if (is_correct) {
							if (word_index < words_2.length - 1) {
								nextWord()
							} else {
								setCheckpointSuccess(phase_idx, () => {
									nextPhase()
								})
							}
						} else {
							if (!chain_broken) {
								shakeChain(() => {
									setCheckpointDanger(phase_idx)
									word_introduction(word_index)
								})
							} else {
								hideChain(async () => {
									// TODO: show the answer
									setCheckpointFail(phase_idx)
									nextPhase()
								})
							}
						}
					}
				}

				if (char_index === words_2[word_index].chain_chars_count - 1) {
					if (!user_know_how_to_backspace) {
						// shakeWrongChars()
					}
				}
			})
		} else if (location === 'chain' && !verified) {
			user_know_how_to_backspace = true
			sound.play('stone-hit')
			moveToStage(e.target, pickRandom(getEmptyStageIdx()), () => {
				updateCharIdx()
			})
		}
	}

	/*
		normal mode: allow a chance for re-spell
		show a broken chain to indicate "re-spell chance is used" + crap sound
		game bar show a flashing star
		then play and vocab audio
	*/
	const shakeChain = (cb) => {
		if (!cb) cb = () => {}
		sound.play('flute-alert-short')
		chain_broken = true
		let el = chain_els[word_index]
		gsap.timeline().to(el, {
			x: "+=50",
			duration: 0.1
		}).to(el, {
			x: "-=50",
			duration: 0.1
		}).to(el, {
			x: "+=20",
			duration: 0.1
		}).to(el, {
			x: "-=20",
			duration: 0.1,
			onComplete: () => {
				moveChainCharsToStage(char_els[word_index], () => {
					setTimeout(cb, 800)
				})
			}
		})
	}

	const hideChain = (cb) => {
		sound.play('boom')
		gsap.to(getAllChainEls(), {
			autoAlpha: 0,
			duration: 0.8,
			onComplete: () => {
				cb()
			}
		})
	}

	const nextPhase = () => {
		dispatch('next')
	}

	const nextWord = (cb) => {
		sound.play('magic-unlock')
		word_index++
		char_index = 0
		moveChainToWord(word_index, () => {
			word_introduction(word_index, () => {
				prepareStage(cb)
			})
		})
	}

	const addNextBenchCharToStage = () => {
		let empty_stage_idx_list = getEmptyStageIdx()
		let bench_chars = getBenchChars()
		if (bench_chars.length && empty_stage_idx_list.length >= 1) {
			let next_char = getNextChar()
			let all_char_on_stage = getStageChars().map(el => el.getAttribute("data-char"))
			let is_on_stage = all_char_on_stage.includes(next_char)
			// console.log(`next char: ${next_char}, all_char_on_stage: ${all_char_on_stage}, is_on_stage: ${is_on_stage}`)
			let selected_bench_el
			if (is_on_stage) {
				selected_bench_el = pickRandom(bench_chars)
			} else {
				selected_bench_el = bench_chars.find(el => el.getAttribute("data-char") === next_char) || pickRandom(bench_chars)
			}
			if (!selected_bench_el) return console.warn(`addNextBenchCharToStage: cannot find ${next_char} from bench`)
			moveToStage(selected_bench_el, pickRandom(empty_stage_idx_list))
		}
	}

	const verifyWord = () => {
		let this_round_chars_els = char_els[word_index]
		return this_round_chars_els.every(el => el.getAttribute('data-correct') === '1')
	}

	const verifyToBeVerifyWord = () => {
		const is_correct = getToBeVerifyChars().every(el => el.getAttribute('data-correct') === '1')
		if (is_correct) {
			getToBeVerifyChars().forEach(el => {
				el.setAttribute('data-verified', '1')
			})
		}
		return is_correct
	}

	const moveChainCharsToStage = (els, cb) => {
		let this_round_chars_els = els
		sound.play('sci-fi-laser')
		this_round_chars_els.forEach((el, i) => {
			const idx = pickRandom(getEmptyStageIdx())
			if (idx >= 0) {
				moveToStage(el, idx, () => {
					if (i === 0) {
						updateCharIdx()
						if (cb) cb()
					}
				})
			} else {
				moveToBench(el)
				updateCharIdx()
			}
		})
	}

	const verifyChar = input_char => {
		const correct_char = words_2[word_index].all_chars[char_index]
		return input_char === correct_char ? 1 : 0
	}

	const popupBubble = stage_idx => {
		const bubble_el = stage_char_box_els[stage_idx]
		gsap.to(bubble_el, {
			autoAlpha: 1,
			scale: 1,
			duration: 0.35,
			onComplete: () => {
				animateBubble(bubble_el)
			}
		})
	}

	const burstBubble = stage_idx => {
		const bubble_el = stage_char_box_els[stage_idx]
		gsap.killTweensOf(bubble_el)
		gsap.to(bubble_el, {
			autoAlpha: 0,
			scale: 0,
			duration: 0.35
		})
	}

	const animateBubble = (node) => {
		const d = 2
		gsap.timeline({
			repeat: -1,
		}).to(node, {
			scaleX: 1.05,
			scaleY: 0.95,
			duration: d * 0.2
		}).to(node, {
			scaleX: 0.9,
			scaleY: 1.1,
			duration: d * 0.28
		}).to(node, {
			scaleX: 1.02,
			scaleY: 0.98,
			duration: d * 0.2
		}).to(node, {
			scaleX: 0.98,
			scaleY: 1.02,
			duration: d * 0.12
		}).to(node, {
			scaleX: 1,
			scaleY: 1,
			duration: d * 0.2
		})
	}

	const moveToChain = (el, cb) => {
		// console.log('move to chain',  char_index, getCurrentStepLastIdx())
		if (mode === 'easy' && char_index > getCurrentStepLastIdx()) return
		sound.play('ball-tap')
		const is_correct = verifyChar(el.getAttribute('data-char'))
		moveCharTo(el, chain_els[word_index][char_index], () => {
			el.setAttribute('data-animated-to-stage', 1)
			cb()
		})
		const stage_idx = el.getAttribute('data-stage-idx')
		el.setAttribute('data-stage-idx', -1)
		el.setAttribute('data-chain-idx', char_index)
		el.setAttribute('data-location', 'chain')
		el.setAttribute('data-correct', is_correct)
		if (mode === 'easy') {
			el.setAttribute('data-to-be-verify', '1')
		}
		updateCharIdx()
		burstBubble(stage_idx)
	}

	/*
		move the char from bench to stage (main area)
	 */
	const moveToStage = (el, stage_idx, cb) => {
		moveCharTo(el, stage_char_box_els[stage_idx], cb)
		el.setAttribute('data-stage-idx', stage_idx)
		el.setAttribute('data-chain-idx', -1)
		el.setAttribute('data-location', 'stage')
		el.setAttribute('data-correct', -1)
		el.setAttribute('data-animated-to-stage', -1)
		popupBubble(stage_idx)
	}

	const moveToBench = el => {
		let target_el = bench_holder_els[word_index]
		moveCharTo(el, target_el)
		el.setAttribute('data-stage-idx', -1)
		el.setAttribute('data-chain-idx', -1)
		el.setAttribute('data-location', 'bench')
		el.setAttribute('data-correct', -1)
		el.setAttribute('data-animated-to-stage', -1)
	}

	const prepareStage = (cb, config) => {
		let mute = config ? config.mute: false
		let word_char_els = getEssentialCharElFromBench()
		word_char_els.forEach((el,i) => {
			setTimeout(() => {
				if (!mute) sound.play('tap')
				let target_idx = pickRandom(getEmptyStageIdx())
				moveToStage(el, target_idx, () => {
					if (i === word_char_els.length - 1) {
						if (cb) cb()
					}
				})
			}, i * 120)
		})
	}

	const getEmptyStageIdx = () => {
		let _char_els = char_els[word_index]
		let all_bench = _char_els.map(el => Number(el.getAttribute("data-stage-idx")))
		return [...Array(MAX_STAGE_CHARS).keys()].filter(i => !all_bench.includes(i))
	}

	const getBenchChars = () => {
		let _char_els = char_els[word_index]
		return _char_els.filter(el => Number(el.getAttribute("data-location") === "bench"))
	}

	const getStageChars = () => {
		let _char_els = char_els[word_index]
		return _char_els.filter(el => Number(el.getAttribute("data-location") === "stage"))
	}

	const getChainChars = () => {
		let _char_els = char_els[word_index]
		return _char_els.filter(el => Number(el.getAttribute("data-location") === "chain"))
	}

	const getWatermarkChars = () => {
		return watermark_char_els.reduce((a,b) => [...a, ...b], [])
	}

	const getAllChainEls = () => {
		const all_chain_holders = chain_els.reduce((a,b) => [...a, ...b], [])
		const all_chars = char_els.reduce((a,b) => [...a, ...b], [])
		const all_chars_on_chain = all_chars.filter(el => Number(el.getAttribute("data-location") === "chain"))
		return [...all_chain_holders, ...all_chars_on_chain, ...chain_link_els]
	}

	const isAllCharAnimatedToStage = () => {
		let _char_els = char_els[word_index]
		return _char_els.every(el => el.getAttribute("data-animated-to-stage") === "1")
	}

	const getToBeVerifyCharCount = () => {
		let _char_els = char_els[word_index]
		return _char_els.filter(el => el.getAttribute("data-animated-to-stage") === "1" && el.getAttribute("data-to-be-verify") === "1").length
	}

	const getToBeVerifyChars = () => {
		let _char_els = char_els[word_index]
		return _char_els.filter(el => el.getAttribute("data-animated-to-stage") === "1" && el.getAttribute("data-to-be-verify") === "1")
	}

	/*
		if all the char is filled, return true
	 */
	const updateCharIdx = () => {
		let unoccupied = getUnoccupiedChainIdx()
		let first_unoccupied_idx = unoccupied[0]
		char_index = first_unoccupied_idx
		return first_unoccupied_idx
	}

	const getUnoccupiedChainIdx = () => {
		let _char_els = char_els[word_index]
		const occupied_boxes_idx = _char_els.map(el => Number(el.getAttribute('data-chain-idx'))).filter(num => num >= 0)
		// console.log('occupied_boxes_idx', occupied_boxes_idx)
		let unoccupied_chain_idx_s = []
		for (let i = 0; i < words_2[word_index].chain_chars_count; i++){
			if (!occupied_boxes_idx.includes(i)) {
				unoccupied_chain_idx_s.push(i)
			}
		}
		return unoccupied_chain_idx_s
	}

	const getEmptyStageCount = () => {
		let _char_els = char_els[word_index]
		let els_on_stage = _char_els.filter(el => Number(el.getAttribute("data-location") === "stage"))
		const current_word_stage_char_count = words_2[word_index].staged_chars_count
		const els_not_on_stage = current_word_stage_char_count - els_on_stage.length
		return Math.min(MAX_STAGE_CHARS, els_not_on_stage)
	}

	const getNextChar = () => {
		let chars = words_2[word_index].all_chars
		let unoccupied_idx = getUnoccupiedChainIdx()
		// console.log('unoccupied_idx', unoccupied_idx)
		let next_idx = unoccupied_idx[0]
		return chars[next_idx]
	}

	const getEssentialCharElFromBench = () => {
		let chars = words_2[word_index].all_chars
		let unoccupied_idx = getUnoccupiedChainIdx()
		let required_unoccupied_idx = unoccupied_idx.length > 3 ? unoccupied_idx.slice(0,3) : unoccupied_idx
		let required_unoccupied_char = required_unoccupied_idx.map(i => chars[i])
		let chars_on_stage = getStageChars().map(el => el.getAttribute('data-char'))
		required_unoccupied_char = required_unoccupied_char.filter(char => !chars_on_stage.includes(char))
		let bench_el = getBenchChars()
		let required_unoccupied_el = []
		 required_unoccupied_char.forEach(char => {
			 let idx = bench_el.findIndex(el => el.getAttribute("data-char") === char)
			 let _el = bench_el.splice(idx, 1)
			 required_unoccupied_el.push(_el[0])
		})
		let empty_stage_count = getEmptyStageCount()
		let essential_char_count = required_unoccupied_char.length
		let random_select_count = empty_stage_count - essential_char_count
		const random_select_from_other = shuffle(bench_el).slice(0, random_select_count)
		return shuffle([...required_unoccupied_el, ...random_select_from_other])
	}

	const setCharBoxWidth = () => {
		const largest_chars_count = words_2.map(w => w.chain_chars_count).sort((a,b) => b - a)[0]
		chain_char_width = Math.min((window.innerWidth * 0.9) / largest_chars_count, 200)
	}

	onMount(async () => {
		words.forEach(w => {
			const all_chars = w.word.split('')
			words_2.push({
				word: w.word,
				all_chars,
				staged_chars_count: Math.min(MAX_STAGE_CHARS, all_chars.length),
				chain_chars_count: all_chars.length,
				audio: w.audio
			})
		})
		words_2 = words_2
		setCharBoxWidth()
		await tick()
		phaseIntroduction()
	})

	const left = () => {
		gsap.to(getAllChainEls(), {
			x: "-=100"
		})
	}

	const right = () => {
		gsap.to(getAllChainEls(), {
			x: "+=100"
		})
	}

	const moveChainToWord = (idx, cb) => {
		if (!cb) cb = () => {}
		const word_char_count = words_2[idx].chain_chars_count
		const word_length = word_char_count * chain_char_width
		const x = (window.innerWidth - word_length) / 2
		const first_chain_box = chain_els[idx][0]
		const diff = first_chain_box.getBoundingClientRect().x - x + 20
		gsap.to(getAllChainEls(), {
			x: `-=${diff}`,
			onComplete: cb
		})
	}

	const phaseIntroduction = () => {
		const last_chain = chain_els[words_2.length-1]
		const last_chain_box = last_chain[last_chain.length - 1]
		const diff = last_chain_box.getBoundingClientRect().x + window.innerWidth + 100
		gsap.set(stage_char_box_els, {
			autoAlpha: 0,
			scale: 0
		})
		gsap.set(getWatermarkChars(), {
			opacity: 0
		})
		const audio_after_animation_offset = 0.3
		const animation_duration = (sound.getDuration(phase_audio) + audio_after_animation_offset) * 1.1
		gsap.timeline().fromTo(getAllChainEls(), {
			x: `+=${window.innerWidth}`,
			y: 50
		}, {
			x: `-=${diff}`,
			duration: animation_duration,
			ease: "sine.inOut",
			onComplete: () => {
				moveChainToWord(word_index, () => {
					if (words_2.length > 1) {
						word_introduction(word_index, () => {
							prepareStage()
							if (mode === 'normal') {
								setCheckpointActive(phase_idx)
							} else if (mode === 'easy') {
								highlightSteps()
							}
						})
					} else {
						if (mode === 'normal') {
							setCheckpointActive(phase_idx, () => {
								prepareStage()
							})
						} else {
							highlightSteps()
							prepareStage(null, {mute: true})
						}
					}
				})
			}
		}).to(getAllChainEls(), {
			y: 0
		})

		flash_watermark_hints(getAllChainEls(), getWatermarkChars(), animation_duration / getAllChainEls().length * 0.95)

		setTimeout(() => {
			sound.play(phase_audio)
		}, audio_after_animation_offset * 1000)
	}

	const word_introduction = (_word_index, cb) => {
		sound.stop(words_2[_word_index].audio)
		sound.play(words_2[_word_index].audio)
		if (mode === 'easy') {
			flash_watermark_hints(chain_els[word_index], watermark_char_els[word_index], 0.08, cb)
		} else {
			if (cb) cb()
		}
	}

	const flash_watermark_hints = (_chain_els, _watermark_els, stagger_duration, cb) => {
		stagger_duration = stagger_duration || 0.15 // just provide a fallback duration if not given (when audio duration is not known)
		const each_duration = stagger_duration * 2
		if (!cb) cb = () => {}
		gsap.to(_chain_els, {
			background: "#CCE8FF",
			stagger: { // wrap advanced options in an object
				each: stagger_duration,
				yoyo: true,
				repeat: 1
			},
			duration: each_duration,
			onComplete: cb
		})
		gsap.to(_watermark_els, {
			opacity: 1,
			stagger: { // wrap advanced options in an object
				each: stagger_duration,
				yoyo: true,
				repeat: 1
			},
			duration: each_duration
		})
	}

	const shakeWrongChars = () => {
		let chars = getChainChars()
		chars = chars.filter(el => el.getAttribute('data-correct') === '0')
		if (chars.length) {
			user_know_how_to_backspace = true
			// sound.play('flute-alert-short')
			gsap.timeline().to(chars, {
				x: "+=10",
				duration: 0.1
			}).to(chars, {
				x: "-=10",
				duration: 0.1
			}).to(chars, {
				x: "+=5",
				duration: 0.1
			}).to(chars, {
				x: "-=5",
				duration: 0.1
			})
			gsap.to(chars, {
				opacity: 0.2,
				duration: 0.2,
				yoyo: true,
				repeat: 1
			})
		}
	}

	const completeSteps = () => {
		getToBeVerifyChars().forEach(el => {
			el.setAttribute('data-to-be-verify', '-1')
		})
		const active_chain_els = chain_els[word_index].filter(el => el.getAttribute('data-step-status') === 'active')
		active_chain_els.forEach(el => {
			el.setAttribute('data-step-status', 'complete')
		})
		gsap.killTweensOf(active_chain_els)
		gsap.set(active_chain_els, {
			background: '#f0f0f0'
		})
		addCombo(active_chain_els.length)
	}

	const getStepLength = () => {
		const completed_count = chain_els[word_index].filter(el => el.getAttribute('data-step-status') === 'complete').length
		const total_count = words_2[word_index].chain_chars_count
		const remaining_step_count = total_count - completed_count
		return Math.min(3, remaining_step_count)
	}

	const highlightSteps = () => {
		let start = chain_els[word_index].map(el => el.getAttribute('data-step-status')).lastIndexOf('complete') + 1
		let length = getStepLength()
		const targets = chain_els[word_index].slice(start, start + length)
		targets.forEach(el => {
			el.setAttribute('data-step-status', 'active')
		})
		gsap.to(targets, {
			background: '#FEFFBB',
			stagger: 0.15,
			repeat: -1,
			yoyo: true
		})
	}

	const getCurrentStepLastIdx = () => {
		return chain_els[word_index].map(el => el.getAttribute('data-step-status')).lastIndexOf('active')
	}

	const onKeydown = e => {
		const code = e.keyCode
		if (code === 37) { // left
			// left()
			hideChain(async () => {
				setCheckpointFail(phase_idx)
				nextPhase()
			})
		} else if (code === 39) { // right
			setCheckpointSuccess(phase_idx, () => {
				nextPhase()
			})
		} else if (code === 38) { // up
			dispatch('game-over')
		} else if (code === 40) { // down
		}
	}
</script>

<svelte:window on:keydown={onKeydown}/>

<div class="overflow-hidden flex flex-col" style="height: calc(100vh - 4em)">
	<div class="flex-1 flex items-center">
		<div class="flex items-center">
			{#each words_2 as w, i}
				<div class="flex">
					{#each w.all_chars as c, j}
						<div bind:this={chain_els[i][j]}
						     data-step-status="inactive"
						     style="width: {chain_char_width}px; background-color: {mode === 'easy' ? '#E6F7FF' : '#6BBAF9'}"
						     class="char-box h-20 mr-0.5 flex items-center justify-center">
							<div bind:this={watermark_char_els[i][j]} class="pointer-events-none">
								<Alphabet char={c} stroke_color="rgba(0,0,0,0.1)" text_color="rgba(0,0,0,0.3)"/>
							</div>
						</div>
					{/each}
				</div>
				{#if i < words_2.length - 1}
					<div bind:this={chain_link_els[i]} class="w-8 h-2.5 bg-blue-500 char-box-link"></div>
				{/if}
			{/each}
		</div>
	</div>

	<div class="flex-1 flex items-center relative">
		<div class="w-full flex flex-wrap my-4 justify-center">
			{#each [...Array(MAX_STAGE_CHARS).keys()] as j}
				<div class="flex justify-center flex w-1/3" class:-mt-8={j >= 3}>
					<div bind:this={stage_char_box_els[j]} class="bubble h-24 w-24 border border-gray-300 rounded-full"></div>
				</div>
			{/each}
		</div>
		{#each words_2 as w,i}
			<div class="absolute left-full bottom-0 w-24 h-24" bind:this={bench_holder_els[i]}>
				{#each w.all_chars as c,j}
					<div on:touchstart={onCharClick} bind:this={char_els[i][j]}
					     data-location="bench"
					     data-stage-idx="-1"
					     data-chain-idx="-1"
					     data-char={c}
					     data-correct="-1"
					     data-animated-to-stage="-1"
					     class="absolute cursor-pointer">
						<div class="pointer-events-none">
							<Alphabet text_color={mode === 'easy' ? '#F69CCA' : '#ED7182'} char={c}/>
						</div>
					</div>
				{/each}
			</div>
		{/each}
	</div>
</div>

<style>
	.bubble {
		background: radial-gradient(rgba(255,255,255,0.5), white);
		box-shadow: 0 0 20px 20px rgba(255,255,255,0.3);
	}

	.char-box {
		box-shadow: 10px 10px 0 0 #3E749F;
		background: #6BBAF9;
	}

	.char-box-link {
		background: #6BBAF9;
		box-shadow: 10px 10px 0 0 #3E749F;
	}

	.char-box:first-child {
		border-radius: 1em 0 0 1em;
	}

	.char-box:last-child {
		border-radius: 0 1em 1em 0;
	}
</style>
