import { getRarity } from './getRarity'
import fishes from '../data/fishes.json'
import { promises as fs } from 'fs'
import path from 'path'

const parsedFishes = fishes.map((fish) => ({
	...fish,
	rarity: getRarity(fish),
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
