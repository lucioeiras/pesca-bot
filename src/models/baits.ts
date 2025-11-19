import { collections } from '../config/db'

import type { User } from '../types/user'

export class Baits {
	static async available(user: User): Promise<number> {
		const now = Date.now()
		const REGEN_INTERVAL = 2 * 60 * 60 * 1000 // 2h em ms

		// Conta quantas iscas estão disponíveis (slot === 0 ou já passou o tempo de regeneração)
		const availableBaits = user.baitSlots.filter((slot) => {
			if (slot === 0) return true
			return now - slot >= REGEN_INTERVAL
		}).length

		return availableBaits
	}

	static async time(user: User): Promise<number> {
		const now = Date.now()

		const MAX_BAITS = 5
		const REGEN_INTERVAL = 2 * 60 * 60 * 1000 // 2 horas em ms

		const availableBaits = user.baitSlots.filter((slot) => slot === 0).length

		if (availableBaits >= MAX_BAITS) {
			// Se já está cheio, não falta tempo
			return 0
		}

		// Encontra o slot mais antigo que está regenerando (menor timestamp > 0)
		const regeneratingSlots = user.baitSlots.filter((slot) => slot > 0)

		if (regeneratingSlots.length === 0) {
			return 0
		}

		const oldestSlot = Math.min(...regeneratingSlots)
		const timePassed = now - oldestSlot
		const timeRemaining = REGEN_INTERVAL - timePassed

		return timeRemaining > 0 ? timeRemaining : 0
	}

	static async update(user: User): Promise<void> {
		const now = Date.now()
		const REGEN_INTERVAL = 2 * 60 * 60 * 1000 // 2h em ms
		const updatedSlots = [...user.baitSlots]

		// Encontra o primeiro slot disponível (valor 0 ou já regenerado) e marca como usado
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
}
