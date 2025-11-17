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
