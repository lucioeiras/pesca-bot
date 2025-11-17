import { v4 as uuidv4 } from 'uuid'
import { promises as fs } from 'fs'
import path from 'path'

import { getRarity } from './getRarity'

import fishes from '../data/fishes.json'

const parsedFishes = fishes.map((fish) => ({
	...fish,
	rarity: getRarity(fish),
	id: uuidv4(),
	weight: fish.maxWeight ?? Math.round(0.01 * Math.pow(fish.maxLength, 3)),
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
