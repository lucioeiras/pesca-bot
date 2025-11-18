import type { UUID } from 'mongodb'

import type { Rod } from './rod'
import type { Trash } from '../types/trash'

import fishes from '../data/fishes.json'
import trash from '../data/trash.json'

export type Fish = {
	id: UUID
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

type Stats = {
	userTotal: number
	total: number
	rarestFish: Fish | null
	heavierFish: Fish | null
	lighterFish: Fish | null
}

export const getStats = (userFishes: UUID[]): Stats => {
	const uniqueUserFishIds = new Set(userFishes.map((id) => id.toString()))
	const totalUserFishes = uniqueUserFishIds.size
	const totalFishes = fishes.length

	const rarestFish = fishes
		.filter((fish) => uniqueUserFishIds.has(fish.id.toString()))
		.sort((a, b) => b.rarity.score - a.rarity.score)[0]

	const heavierFish = fishes
		.filter((fish) => uniqueUserFishIds.has(fish.id.toString()))
		.sort((a, b) => b.weight - a.weight)[0]

	const lighterFish = fishes
		.filter((fish) => uniqueUserFishIds.has(fish.id.toString()))
		.sort((a, b) => a.weight - b.weight)[0]

	return {
		userTotal: totalUserFishes,
		total: totalFishes,
		rarestFish,
		heavierFish,
		lighterFish,
	}
}
