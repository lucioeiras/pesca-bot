import type { Message } from 'whatsapp-web.js'

import { fishing } from '../services/fishing'
import { User } from '../models/user'

export class FishingController {
	static async fishing(message: Message) {
		if (message.fromMe) {
			const user = await User.findByNumber('5535998974580')

			if (user) {
				const replyMessage = await fishing(user)

				message.reply(replyMessage)
			}
		} else {
			const contact = await message.getContact()
			const senderId = message.author || message.from

			let user = await User.findByNumber(contact.number)

			if (!user) {
				user = await User.store({ contact, senderId })
			}

			const replyMessage = await fishing(user)

			message.reply(replyMessage)
		}
	}
}
