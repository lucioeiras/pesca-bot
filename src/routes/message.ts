import { client } from '../index.js'

import { FishingController } from '../controllers/fishing.js'
import { RankingController } from '../controllers/ranking.js'

client.on('message_create', (message) => {
	if (message.body === '!diego-pesca' || message.body === '!diego-pescar') {
		FishingController.fishing(message)
	}

	if (message.body === '!diego-ranking-pesado') {
		RankingController.getHeavierRank(message)
	}

	if (message.body === '!diego-ranking-raro') {
		RankingController.getRarestRank(message)
	}

	if (message.body === '!diego-ranking-total') {
		RankingController.getTotalFishRank(message)
	}
})
