import { ObjectId } from 'mongodb'
import type { Contact } from 'whatsapp-web.js'

import { collections } from '../config/db'

import type { User as UserType } from '../types/user'

import rods from '../data/rods.json'

type CreateEmptyUserProps = {
	contact: Contact
	senderId: string
}

export default class User {
	static async index() {
		const users = (await collections.users?.find({}).toArray()) as UserType[]

		return users
	}

	static async findById(id: ObjectId): Promise<UserType | null> {
		const user = (await collections.users?.findOne({
			_id: id,
		})) as UserType | null

		return user
	}

	static async findByNumber(number: string): Promise<UserType | null> {
		const user = (await collections.users?.findOne({
			number,
		})) as UserType | null

		return user
	}

	static async store({
		contact,
		senderId,
	}: CreateEmptyUserProps): Promise<UserType> {
		const createNewUser = await collections.users?.insertOne({
			name: contact.pushname || senderId,
			number: contact.number,
			rod: rods[0],
			xp: 0,
			fishesIds: [],
			baitSlots: [0, 0, 0, 0, 0], // Todos os slots começam cheios (0 = disponível)
		})

		const newUser = (await collections.users?.findOne({
			_id: createNewUser?.insertedId,
		})) as UserType

		return newUser
	}

	static async update(user: UserType): Promise<void> {
		await collections.users?.updateOne({ _id: user._id }, { $set: { ...user } })
	}
}
