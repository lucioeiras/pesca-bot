import type { UUID } from 'mongodb'

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
