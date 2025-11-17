export const getXP = (
	rarityScore: number, // entre 0 (comum) e 1 (lendário)
	weight: number,
	maxLength: number | null | undefined, // em cm
): number => {
	// Defina um peso base (ex: 25 XP mínimo)
	const baseXp = 25

	// Raridade contribui fortemente: até 100 de bônus em casos lendários
	const rarityBonus = Math.round(rarityScore * 100)

	// Peixe grande: decida uma escala (ex: +1 XP a cada 10cm, +1 a cada 500g)
	const sizeBonus = maxLength ? Math.floor(maxLength / 10) : 0
	const weightBonus = weight ? Math.floor(weight / 500) : 0

	// Soma total
	const totalXp = baseXp + rarityBonus + sizeBonus + weightBonus

	// XP nunca menor que 1
	return Math.max(totalXp, 1)
}
