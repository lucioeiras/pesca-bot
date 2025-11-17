import 'dotenv/config'

import { Client } from 'whatsapp-web.js'
import qrcode from 'qrcode-terminal'
import { ObjectId } from 'mongodb'

import { collections, connectToDatabase } from './config/db'

import rods from './data/rods.json'
import type User from './models/user'
import { play } from './utils/play'

await connectToDatabase()

const client = new Client({})

client.on('ready', () => {
	console.log('Client is ready!')
})

client.on('qr', (qr) => {
	qrcode.generate(qr, { small: true })
})

client.on('message_create', async (message) => {
	if (message.body === '!diego-pesca' || message.body === '!diego-pescar') {
		if (message.fromMe) {
			const user = (await collections.users?.findOne({
				_id: new ObjectId('691b67dd84f98257dc1b49ba'),
			})) as User | null

			user && (await play({ user, message }))
		} else {
			const contact = await message.getContact()
			const number = contact.number
			const senderId = message.author || message.from

			const user = (await collections.users?.findOne({ number })) as User

			if (user) {
				play({ user, message })
			} else {
				const createNewUser = await collections.users?.insertOne({
					name: contact.pushname || senderId,
					number,
					rod: rods[0],
					xp: 0,
					fishesIds: [],
					baits: 5,
				})

				const newUser = (await collections.users?.findOne({
					_id: createNewUser?.insertedId,
				})) as User

				console.log(newUser)
				play({ user: newUser, message })
			}
		}
	}
})

client.initialize()
