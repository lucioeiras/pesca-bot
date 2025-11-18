import type { UUID } from 'mongodb'

import type { Rod as RodType } from '../types/rod'
import type { Fish as FishType } from '../types/fish'
import type { Trash as TrashType } from '../types/trash'

import fishes from '../data/fishes.json'
import trash from '../data/trash.json'

export class Fish {
	static random(rod: RodType): {
		fish: FishType | null
		trash: TrashType | null
	} {
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

	static findRarest(userFishes: UUID[]): FishType | null {
		const uniqueUserFishIds = new Set(userFishes.map((id) => id.toString()))

		const rarestFish = fishes
			.filter((fish) => uniqueUserFishIds.has(fish.id.toString()))
			.sort((a, b) => b.rarity.score - a.rarity.score)[0]

		return rarestFish || null
	}

	static findHeavier(userFishes: UUID[]): FishType | null {
		const uniqueUserFishIds = new Set(userFishes.map((id) => id.toString()))

		const heavierFish = fishes
			.filter((fish) => uniqueUserFishIds.has(fish.id.toString()))
			.sort((a, b) => b.weight - a.weight)[0]

		return heavierFish || null
	}

	static findTotal(userFishes: UUID[]): { userTotal: number; total: number } {
		const uniqueUserFishIds = new Set(userFishes.map((id) => id.toString()))
		const totalUserFishes = uniqueUserFishIds.size
		const totalFishes = fishes.length

		return { userTotal: totalUserFishes, total: totalFishes }
	}
}
