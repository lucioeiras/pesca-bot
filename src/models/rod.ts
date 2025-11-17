import rods from '../data/rods.json'

export type Rod = {
	name: string
	xpNext: number
	rarityModifier: number
	xpModifier: number
	depthModifier: number
	weightModifier: number
	emoji: string
}

export const getXP = (
	rarityScore: number, // entre 0 (comum) e 1 (lendário)
	weight: number,
	maxLength: number | null | undefined, // em cm
): number => {
	// Defina um peso base (ex: 25 XP mínimo)
	const baseXp = 25

	// Raridade contribui fortemente: até 100 de bônus em casos lendários
	const rarityBonus = Math.round(rarityScore * 100)

	// Soma total
	const totalXp = baseXp + rarityBonus

	// XP nunca menor que 1
	return Math.max(totalXp, 1)
}

export const getNewRod = (currentRod: Rod): Rod => {
	const rodIndex = rods.findIndex((rod) => rod.name === currentRod.name)

	return rods[rodIndex + 1] || currentRod
}

export const isLevelingUp = (currentRod: Rod, currentXp: number): boolean => {
	const rodIndex = rods.findIndex((rod) => rod.name === currentRod.name)

	if (rods[rodIndex] && rods[rodIndex].xpNext <= currentXp) {
		return true
	}

	return false
}

export const getXPForNextRod = (currentRod: Rod, currentXp: number): number => {
	return currentRod.xpNext - currentXp
}
