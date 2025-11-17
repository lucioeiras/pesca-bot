import { ObjectId, UUID } from 'mongodb'

import { getNewRod, type Rod } from './rod'
import { collections } from '../config/db'
import type { Contact } from 'whatsapp-web.js'

import rods from '../data/rods.json'

type CreateEmptyUserProps = {
	contact: Contact
	senderId: string
}

export default class User {
	constructor(
		public _id: ObjectId,
		public name: string,
		public number: string,
		public rod: Rod,
		public xp: number,
		public fishesIds: UUID[],
		public baits: number,
		public lastBaitsAt: number,
	) {}
}

export const createEmptyUser = async ({
	contact,
	senderId,
}: CreateEmptyUserProps): Promise<User> => {
	const createNewUser = await collections.users?.insertOne({
		name: contact.pushname || senderId,
		number: contact.number,
		rod: rods[0],
		xp: 0,
		fishesIds: [],
		baits: 5,
	})

	const newUser = (await collections.users?.findOne({
		_id: createNewUser?.insertedId,
	})) as User

	return newUser
}

export const handleLevelUp = async (user: User): Promise<Rod> => {
	const newRod = getNewRod(user.rod)

	await collections.users?.updateOne(
		{ _id: user._id },
		{ $set: { rod: newRod } },
	)

	return newRod
}

export const storeNewFish = async (
	user: User,
	fishId: UUID,
	xp: number,
): Promise<void> => {
	await collections.users?.updateOne(
		{
			_id: user._id,
		},
		{
			$set: {
				fishesIds: [...user?.fishesIds, fishId],
				xp: user?.xp + xp,
				baits: user?.baits - 1,
				lastBaitsAt: new Date(),
			},
		},
	)
}

export const handleBaits = async (user: User): Promise<number> => {
	const now = Date.now()

	const MAX_BAITS = 5
	const REGEN_INTERVAL = 2 * 60 * 60 * 1000 // 2h em ms

	const currentBaits = user.baits

	if (currentBaits >= MAX_BAITS) {
		// Se já está cheio, só atualiza o timestamp se quiser
		await collections.users?.updateOne(
			{ _id: user._id },
			{ $set: { lastBaitsAt: now } },
		)
	} else {
		const timePassed = now - user.lastBaitsAt
		const regenerated = Math.floor(timePassed / REGEN_INTERVAL)

		if (regenerated > 0) {
			const newBaits = Math.min(currentBaits + regenerated, MAX_BAITS)

			// Atualiza o timestamp para o ponto em que a última isca foi regenerada
			const remainder = timePassed % REGEN_INTERVAL
			const newTimestamp = now - remainder

			await collections.users?.updateOne(
				{ _id: user._id },
				{ $set: { baits: newBaits, lastBaitsAt: newTimestamp } },
			)

			return newBaits
		}
	}

	return currentBaits
}

export const timeUntilNextBait = (user: User): number => {
	const now = Date.now()

	const MAX_BAITS = 5
	const REGEN_INTERVAL = 2 * 60 * 60 * 1000 // 2 horas em ms

	if (user.baits >= MAX_BAITS) {
		// Se já está cheio, não falta tempo (ou retorne 0)
		return 0
	}

	const timePassed = now - user.lastBaitsAt
	const remainder = REGEN_INTERVAL - (timePassed % REGEN_INTERVAL)

	return remainder > 0 ? remainder : 0
}
