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
			},
		},
	)
}
