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
	rod: Rod,
	rarityScore: number,
	weight: number,
	maxLength: number | null | undefined,
): number => {
	// XP base
	const baseXp = 25

	// Raridade contribui fortemente: até ~1000 em casos lendários
	const rarityBonus = Math.round(rarityScore * 1000)

	// Bônus por peso (ajuste conforme necessário)
	const weightBonus = Math.round(weight / 100000)

	// Bônus por comprimento máximo (se informado)
	const lengthBonus = maxLength ? Math.round(maxLength / 100) : 0

	// Modificador da vara (xpModifier), padrão 1
	const xpModifier = rod?.xpModifier ?? 1

	const totalXp = Math.round(
		(baseXp + rarityBonus + weightBonus + lengthBonus) * xpModifier,
	)

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
