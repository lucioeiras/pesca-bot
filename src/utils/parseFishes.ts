import { v4 as uuidv4 } from 'uuid'
import { promises as fs } from 'fs'
import path from 'path'

import { getRarity } from './getRarity'

import fishes from '../data/fishes.json'

const getWeight = (maxLength: number): number => {
	const weight = Math.round(0.1 * Math.pow(maxLength, 3))

	if (weight < 10) return 10

	return weight
}

const parsedFishes = fishes.map((fish) => ({
	...fish,
	rarity: getRarity(fish),
	id: uuidv4(),
	weight: getWeight(fish.maxLength),
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
