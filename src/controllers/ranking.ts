import type { Message } from 'whatsapp-web.js'
import { getHeavierRank } from '../services/ranking'

export class RankingController {
	static async getHeavierRank(message: Message) {
		const replyMessage = await getHeavierRank()

		message.reply(replyMessage)
	}
}
