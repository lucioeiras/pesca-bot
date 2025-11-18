import 'dotenv/config'

import { Client } from 'whatsapp-web.js'
import qrcode from 'qrcode-terminal'
import { ObjectId } from 'mongodb'

import { collections, connectToDatabase } from './config/db'

import User, {
	createEmptyUser,
	getUserById,
	getUserByNumber,
} from './models/user'
import { play } from './utils/play'
import { getHeavierRank } from './models/rank'

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
			const user = await getUserById(new ObjectId('691b88ac4a10b1f68a794e86'))

			user && (await play({ user, message }))
		} else {
			const contact = await message.getContact()
			const number = contact.number
			const senderId = message.author || message.from

			let user = await getUserByNumber(number)

			if (!user) {
				user = await createEmptyUser({ contact, senderId })
			}

			play({ user, message })
		}
	}

	if (message.body === '!diego-pesca-rank') {
		const usersRanked = await getHeavierRank()

		const replyMessage = {
			header: '🏆 Rank dos peixes mais pesados',
			rank: usersRanked.map(
				(user, index) =>
					index < 10 &&
					`\n\n${index + 1}. ${user.name}: ${user.heaviestFish!.name} de *${user.heaviestFish!.weight / 1000}kg*`,
			),
		}

		message.reply(
			replyMessage.header + replyMessage.rank.filter(Boolean).join(''),
		)
	}
})

client.initialize()
