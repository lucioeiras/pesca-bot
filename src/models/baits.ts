import { collections } from '../config/db'

import type { User } from '../types/user'

export class Baits {
	static async available(user: User): Promise<number> {
		const now = Date.now()
		const REGEN_INTERVAL = 2 * 60 * 60 * 1000 // 2h em ms

		// Gera nova lista resetando somente slots cujo tempo expirou
		let changed = false
		const updatedSlots = user.baitSlots.map((slot) => {
			if (slot === 0) return 0
			if (now - slot >= REGEN_INTERVAL) {
				changed = true
				return 0
			}
			return slot
		})

		// Persistir somente se houve mudança (alguma isca regenerada)
		if (changed) {
			await collections.users?.updateOne(
				{ _id: user._id },
				{ $set: { baitSlots: updatedSlots } },
			)
		}

		const availableBaits = updatedSlots.filter((slot) => slot === 0).length

		return availableBaits
	}

	static async time(user: User): Promise<number> {
		const now = Date.now()

		const MAX_BAITS = 5
		const REGEN_INTERVAL = 2 * 60 * 60 * 1000 // 2 horas em ms

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
