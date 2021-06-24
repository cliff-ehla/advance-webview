// import {isIOS} from "../helpers/device-checking";
// import {get} from 'svelte/store'
// import {shouldRestartAudioCtx} from '@/store/state'

class Sound {
	constructor() {
		this.context = undefined
		this.buffer = {}
		this.duration = {}
		this.audioBufferSourceNodesRef = {}
	}

	/**
	 * this must be triggered by a user gesture
	 * otherwise iOS weird playback bug will appears
	 * i.e. distorted sound, pitch-shifted sound, no-sound after some time....
	 */
	init() {
		this.context = null
		this.context = new (window.AudioContext || window.webkitAudioContext)()
	}

	async loadBatch (keys) {
		const all_promise = keys.map(k => this.load(k))
		return Promise.all(all_promise)
	}

	deleteBatch (keys) {
		keys.forEach(k => this.destroy(k))
	}

	// src_key is optional. only used when given a link and want to assign a specific key (instead of using src as key)
	async load(key, src_key) {
		if (!this.context) {
			this.init()
			// return console.log('audio context is not init')
		}
		if (this.buffer[key]) {
			console.log(`Load(): ${key} has already loaded`)
			return Promise.resolve()
		}
		let src = src_key || key
		let res = await fetch(src)
		const buffer = await res.arrayBuffer()
		await this.context.decodeAudioData(
			buffer,
			(decodedData) => {
				this.duration[key] = decodedData.duration
				this.buffer[key] = decodedData
				// console.log(`Loaded ${key}`)
			},
			(error) => {}
		)
	}

	loadSrc (src, src_key) {
		return this.load(src, src_key)
	}

	loadBuffer (buffer, key, cb) {
		this.context.decodeAudioData(
			buffer,
			(decodedData) => {
				this.duration[key] = decodedData.duration
				this.buffer[key] = decodedData
				if (cb) cb()
			}, (error) => {
				console.log(error)
			}
		)
	}

	loadEmpty() {
		if (!isIOS()) return
		var buffer = this.context.createBuffer(1, 1, 22050)
		this.buffer['empty'] = buffer
	}

	warmUp() {
		if (!isIOS()) return
		this.play('empty')
	}

	async play(key, options = {}) {
		if (!key) return console.warn('sound key is undefined')
		const {noOverlap, onFinish} = options
		if (this.audioBufferSourceNodesRef[key] && noOverlap) return console.log('this key is playing')
		if (this.context && (this.context.state === 'suspended')) {
			this.context.close()
			this.context = new (window.AudioContext || window.webkitAudioContext)()
		}
		return new Promise(async (resolve, reject) => {
			if (!this.context) {
				reject()
			}
			if (!this.buffer[key]) {
				await this.load(key)
			}
			const source = this.context.createBufferSource()
			source.buffer = this.buffer[key]
			source.connect(this.context.destination)
			source.start(0)
			source.addEventListener('ended', () => {
				this.audioBufferSourceNodesRef[key] = null
				delete this.audioBufferSourceNodesRef[key]
				if (onFinish) onFinish()
				resolve()
			})
			this.audioBufferSourceNodesRef[key] = source
		})
	}

	stop (key) {
		let audioBufferSourceNodes = this.audioBufferSourceNodesRef[key]
		if (audioBufferSourceNodes) {
			try {
				audioBufferSourceNodes.stop()
			} catch (e) {}
		}
	}

	stopAll () {
		for (const property in this.audioBufferSourceNodesRef) {
			this.stop(property)
		}
	}

	destroy (key) {
		if (!this.buffer[key]) return console.log('nothing to delete')
		else console.log('delete audio key: ' + key)
		this.buffer[key] = null
		delete this.buffer[key]
		this.duration[key] = null
		delete this.duration[key]
		this.audioBufferSourceNodesRef[key] = null
		delete this.audioBufferSourceNodesRef[key]
	}

	getDuration (key) {
		return this.duration[key]
	}
}

class Playlist {
	constructor() {
		this.id = undefined
		this.sound = sound
		this.list = []
		this.idx = 0
		this.gap = 1000
		this.playing = false
	}

	stop () {
		clearTimeout(this.id)
		this.id = null
		this.sound.stopAll()
		this.playing = false
	}

	play (keys) {
		this.list = keys
		this.playTrack()
	}

	playTrack () {
		if (this.playing) return console.log('playTrack aborted as it is playing')
		let key = this.list[this.idx]
		if (!key) return console.log('play track error: key is undefined')
		let duration = this.sound.getDuration(key) * 1000 + this.gap
		this.sound.play(key)
		this.playing = true
		if (this.id) {
			console.log('should not play track when pending ID is present')
			return clearTimeout(this.id)
		}
		this.id = setTimeout(() => {
			this.playing = false
			if (this.idx === this.list.length - 1) {
				this.idx = 0
			} else {
				this.idx++
			}
			this.id = null
			this.playTrack()
		}, duration)
	}
}
const sound = new Sound()
export {sound, Playlist}
