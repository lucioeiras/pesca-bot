import { collections } from '../config/db'
import rods from '../data/rods.json'

import type { Rod as RodType } from '../types/rod'
import type { User as UserType } from '../types/user'

export class XP {
	static calculate(
		rod: RodType,
		rarityScore: number,
		weight: number,
		maxLength: number | null | undefined,
	): number {
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

	static next(currentRod: RodType, currentXp: number): number {
		return currentRod.xpNext - currentXp
	}

	static verify(currentRod: RodType, currentXp: number): boolean {
		const rodIndex = rods.findIndex((rod) => rod.name === currentRod.name)

		if (rods[rodIndex] && rods[rodIndex].xpNext <= currentXp) {
			return true
		}

		return false
	}

	static async levelUp(user: UserType, nextRod: RodType): Promise<void> {
		await collections.users?.updateOne(
			{ _id: user._id },
			{ $set: { rod: nextRod } },
		)
	}
}
