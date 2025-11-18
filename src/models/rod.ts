import { collections } from '../config/db'
import type { Rod as RodType } from '../types/rod'

export class Rod {
	static async find(index: number): Promise<RodType | null> {
		const rods = (await collections
			.rods!.find({})
			.toArray()) as unknown as RodType[]

		return rods[index] || null
	}

	static async findByName(userRod: RodType): Promise<RodType | null> {
		const rods = (await collections
			.rods!.find({})
			.toArray()) as unknown as RodType[]

		return rods.find((rod) => rod.name === userRod.name) || null
	}

	static async findNext(userRod: RodType): Promise<RodType | null> {
		const rods = (await collections
			.rods!.find({})
			.toArray()) as unknown as RodType[]

		const rodIndex = rods.findIndex((rod) => rod.name === userRod.name)

		return rods[rodIndex + 1] || null
	}
}
