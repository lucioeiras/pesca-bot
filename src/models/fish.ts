import type { Rod } from './rod'
import type { Trash } from '../types/trash'

import fishes from '../data/fishes.json'
import trash from '../data/trash.json'

export type Fish = {
	id: string
	name: string
	genus: string
	species: string
	maxLength: number
	commonLength: number
	weight: number
	maxWeight: number
	depthMax: number
	vulnerability: number
	abundance: string
	rarity: {
		score: number
		category: string
	}
}

type GetRandomFishReturn = {
	fish: Fish | null
	trash: Trash | null
}

export const getRandomFish = (rod: Rod): GetRandomFishReturn => {
	const garbageChance = 0.12

	if (Math.random() < garbageChance) {
		return {
			fish: null,
			trash: trash[Math.floor(Math.random() * trash.length)]!,
		}
	}

	const candidates = fishes.filter(
		(p) =>
			(!p.depthMax || p.depthMax <= rod.depthModifier) &&
			(!p.maxWeight || p.maxWeight <= rod.weightModifier * 100000),
	)

	const chances = candidates.map((fish) => {
		const rarity = fish.rarity?.score ?? 0
		const baseChance = 1 - rarity
		const chanceMod = baseChance * rod.rarityModifier

		return Math.max(chanceMod, 0.05)
	})

	const total = chances.reduce((a, b) => a + b, 0)

	let alvo = Math.random() * total

	for (let i = 0; i < candidates.length; i++) {
		if (alvo < chances[i]!) return { fish: candidates[i]!, trash: null }
		alvo -= chances[i]!
	}

	return {
		fish: null,
		trash: trash[Math.floor(Math.random() * trash.length)]!,
	}
}
