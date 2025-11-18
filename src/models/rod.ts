import rods from '../data/rods.json'

import type { Rod as RodType } from '../types/rod'

export class Rod {
	static find(index: number): RodType | null {
		return rods[index] || null
	}

	static findByName(userRod: RodType): RodType | null {
		return rods.find((rod) => rod.name === userRod.name) || null
	}

	static findNext(userRod: RodType): RodType | null {
		const rodIndex = rods.findIndex((rod) => rod.name === userRod.name)

		return rods[rodIndex + 1] || null
	}
}
