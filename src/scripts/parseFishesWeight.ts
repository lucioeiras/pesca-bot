import { promises as fs } from 'fs'
import path from 'path'

import fishes from '../data/fishes.json'

const getWeight = (maxLength: number): number => {
	if (!maxLength) {
		maxLength = 50 + Math.floor(Math.random() * 150) // comprimento aleatório entre 30 e 100 cm
	}

	const weight = Math.round(0.1 * Math.pow(maxLength, 3))

	if (weight < 10) return 10

	return weight
}

const parsedFishesWeight = fishes.map((fish) => ({
	...fish,
	weight: getWeight(fish.maxLength),
}))

const filePath = path.resolve(__dirname, '../data/fishes.json')

try {
	await fs.writeFile(
		filePath,
		JSON.stringify(parsedFishesWeight, null, 2) + '\n',
		'utf8',
	)
} catch (err) {
	console.error('Failed to write fishes.json:', err)
	throw err
}
