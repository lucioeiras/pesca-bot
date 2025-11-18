import { v4 as uuidv4 } from 'uuid'
import { promises as fs } from 'fs'
import path from 'path'

import { getRarity } from './getRarity'

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

const parsedFishes = parsedFishesWeight.map((fish) => ({
	...fish,
	rarity: getRarity(fish),
	id: uuidv4(),
}))

const filePath = path.resolve(__dirname, '../data/fishes.json')

try {
	await fs.writeFile(
		filePath,
		JSON.stringify(parsedFishes, null, 2) + '\n',
		'utf8',
	)
} catch (err) {
	console.error('Failed to write fishes.json:', err)
	throw err
}
