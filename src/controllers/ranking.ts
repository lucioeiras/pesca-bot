import type { Message } from 'whatsapp-web.js'
import {
	getHeavierRank,
	getRarestRank,
	getTotalFishRank,
} from '../services/ranking'

export class RankingController {
	static async getHeavierRank(message: Message) {
		const replyMessage = await getHeavierRank()

		message.reply(replyMessage)
	}

	static async getRarestRank(message: Message) {
		const replyMessage = await getRarestRank()

		message.reply(replyMessage)
	}

	static async getTotalFishRank(message: Message) {
		const replyMessage = await getTotalFishRank()

		message.reply(replyMessage)
	}
}
