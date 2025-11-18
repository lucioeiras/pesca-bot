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
		public baitSlots: number[],
	) {}
}

export const getAllUsers = async (): Promise<User[]> => {
	const users = (await collections.users?.find({}).toArray()) as User[]

	return users
}

export const getUserById = async (id: ObjectId): Promise<User | null> => {
	const user = (await collections.users?.findOne({ _id: id })) as User | null

	return user
}

export const getUserByNumber = async (number: string): Promise<User | null> => {
	const user = (await collections.users?.findOne({ number })) as User | null

	return user
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
		baitSlots: [0, 0, 0, 0, 0], // Todos os slots começam cheios (0 = disponível)
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
	const now = Date.now()

	// Encontra o primeiro slot disponível (com valor 0) e marca como usado
	const updatedSlots = [...user.baitSlots]
	const firstAvailableIndex = updatedSlots.findIndex((slot) => slot === 0)

	if (firstAvailableIndex !== -1) {
		updatedSlots[firstAvailableIndex] = now
	}

	await collections.users?.updateOne(
		{
			_id: user._id,
		},
		{
			$set: {
				fishesIds: [...user?.fishesIds, fishId],
				xp: user?.xp + xp,
				baits: user?.baits - 1,
				baitSlots: updatedSlots,
			},
		},
	)
}

export const handleBaits = async (user: User): Promise<number> => {
	const now = Date.now()

	const REGEN_INTERVAL = 2 * 60 * 60 * 1000 // 2h em ms

	const updatedSlots = [...user.baitSlots]
	let regeneratedCount = 0

	// Para cada slot que está vazio (timestamp > 0), verifica se já regenerou
	for (let i = 0; i < updatedSlots.length; i++) {
		const slot = updatedSlots[i]
		if (slot !== undefined && slot > 0) {
			const timePassed = now - slot
			if (timePassed >= REGEN_INTERVAL) {
				// Slot regenerou, marca como disponível
				updatedSlots[i] = 0
				regeneratedCount++
			}
		}
	}

	if (regeneratedCount > 0) {
		const newBaits = user.baits + regeneratedCount

		await collections.users?.updateOne(
			{ _id: user._id },
			{ $set: { baits: newBaits, baitSlots: updatedSlots } },
		)

		return newBaits
	}

	return user.baits
}

export const timeUntilNextBait = (user: User): number => {
	const now = Date.now()

	const MAX_BAITS = 5
	const REGEN_INTERVAL = 2 * 60 * 60 * 1000 // 2 horas em ms

	if (user.baits >= MAX_BAITS) {
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
