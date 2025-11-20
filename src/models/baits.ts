import { collections } from '../config/db'

import type { User } from '../types/user'

const REGEN_INTERVAL = 60 * 60 * 1000 // 1h em ms
const MAX_BAITS = 5

export class Baits {
	static async available(user: User): Promise<number> {
		return user.baitSlots.filter((slot) => slot === 0).length
	}

	static async regen(user: User): Promise<void> {
		const now = Date.now()

		const updatedSlots = user.baitSlots.map((slot) =>
			slot === 0 ? 0 : now - slot >= REGEN_INTERVAL ? 0 : slot,
		)

		await collections.users?.updateOne(
			{ _id: user._id },
			{ $set: { baitSlots: updatedSlots } },
		)
	}

	static async consume(user: User): Promise<void> {
		const now = Date.now()

		const updatedSlots = [...user.baitSlots]

		const firstAvailableIndex = updatedSlots.findIndex((slot) => {
			if (slot === 0) return true
			return now - slot >= REGEN_INTERVAL
		})

		if (firstAvailableIndex !== -1) {
			updatedSlots[firstAvailableIndex] = now

			await collections.users?.updateOne(
				{ _id: user._id },
				{ $set: { baitSlots: updatedSlots } },
			)
		}
	}

	static async time(user: User): Promise<number> {
		const now = Date.now()

		// Tratar slots expirados como disponíveis virtualmente
		const effectiveSlots = user.baitSlots.map((slot) => {
			if (slot === 0) return 0
			return now - slot >= REGEN_INTERVAL ? 0 : slot
		})

		const availableBaits = effectiveSlots.filter((slot) => slot === 0).length

		if (availableBaits >= MAX_BAITS) {
			return 0
		}

		// Slots ainda regenerando (timestamp > 0 e não expirado)
		const regeneratingSlots = effectiveSlots.filter((slot) => slot > 0)

		if (regeneratingSlots.length === 0) {
			return 0
		}

		// Menor tempo restante entre os slots ativos
		const remainingTimes = regeneratingSlots.map((slot) => {
			const timePassed = now - slot
			return REGEN_INTERVAL - timePassed
		})
		const timeRemaining = Math.min(...remainingTimes)

		return timeRemaining > 0 ? timeRemaining : 0
	}
}
