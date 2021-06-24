export function shuffle (a) {
	for (let i = a.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[a[i], a[j]] = [a[j], a[i]];
	}
	return a;
}

export function getDiff (el1, el2) {
	const rect1 = el1.getBoundingClientRect()
	const rect2 = el2.getBoundingClientRect()
	return {
		x: rect2.left - rect1.left,
		y: rect2.top - rect1.top
	}
}

export function getDiff2 (el1, el2) {
	const rect1 = el1.getBoundingClientRect()
	const rect2 = el2.getBoundingClientRect()
	return {
		x: rect2.left - rect1.left - (rect1.width / 2 - rect2.width / 2),
		y: rect2.top - rect1.top- (rect1.height / 2 - rect2.height / 2)
	}
}

export function pickRandom (array) {
	return array[Math.floor(Math.random() * array.length)];
}
