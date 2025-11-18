import type { UUID } from 'mongodb'

import type { Rod as RodType } from '../types/rod'
import type { Fish as FishType } from '../types/fish'
import type { Trash as TrashType } from '../types/trash'
import { collections } from '../config/db'

export class Fish {
	static async random(rod: RodType): Promise<{
		fish: FishType | null
		trash: TrashType | null
	}> {
		const garbageChance = 0.12

		const randomTrash = (await collections.trash!.findOne(
			{},
		)) as TrashType | null

		if (Math.random() < garbageChance) {
			return {
				fish: null,
				trash: randomTrash,
			}
		}

		const fishes = (await collections.fishes!.find({}).toArray()) as unknown as
			| FishType[]
			| null

		const candidates = fishes!.filter(
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
			trash: randomTrash!,
		}
	}

	static async findRarest(userFishes: UUID[]): Promise<FishType | null> {
		const uniqueUserFishIds = new Set(userFishes.map((id) => id.toString()))

		const fishes = (await collections.fishes!.find({}).toArray()) as unknown as
			| FishType[]
			| null

		const rarestFish = fishes!
			.filter((fish) => uniqueUserFishIds.has(fish.id.toString()))
			.sort((a, b) => b.rarity.score - a.rarity.score)[0]

		return rarestFish || null
	}

	static async findHeavier(userFishes: UUID[]): Promise<FishType | null> {
		const uniqueUserFishIds = new Set(userFishes.map((id) => id.toString()))

		const fishes = (await collections.fishes!.find({}).toArray()) as unknown as
			| FishType[]
			| null

		const heavierFish = fishes!
			.filter((fish) => uniqueUserFishIds.has(fish.id.toString()))
			.sort((a, b) => b.weight - a.weight)[0]

		return heavierFish || null
	}

	static async findTotal(
		userFishes: UUID[],
	): Promise<{ userTotal: number; total: number }> {
		const uniqueUserFishIds = new Set(userFishes.map((id) => id.toString()))

		const fishes = (await collections.fishes!.find({}).toArray()) as unknown as
			| FishType[]
			| null

		const totalUserFishes = uniqueUserFishIds.size
		const totalFishes = fishes!.length

		return { userTotal: totalUserFishes, total: totalFishes }
	}
}
