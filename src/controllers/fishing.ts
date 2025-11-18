import type { Message } from 'whatsapp-web.js'

import { fishing } from '../services/fishing'

export class FishingController {
	static async fishing(message: Message) {
		const contact = await message.getContact()
		const senderId = message.author || message.from

		const replyMessage = await fishing({ contact, senderId })

		message.reply(replyMessage)
	}
}
