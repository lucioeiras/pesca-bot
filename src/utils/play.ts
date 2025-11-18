import type { Message } from 'whatsapp-web.js'

import type User from '../models/user'
import { getRandomFish, getStats } from '../models/fish'
import { getXP, getXPForNextRod, isLevelingUp } from '../models/rod'
import {
	getUserById,
	handleBaits,
	handleLevelUp,
	storeNewFish,
	timeUntilNextBait,
} from '../models/user'
import { formatRemainingTime } from './formatRemainingTime'

type PlayProps = {
	user: User
	message: Message
}

export const play = async ({ user, message }: PlayProps) => {
	const baits = await handleBaits(user)
	const remainTimeToNextBait = timeUntilNextBait(user)

	if (baits > 0) {
		const { fish, trash } = getRandomFish(user!.rod)

		if (fish) {
			const xp = getXP(fish.rarity?.score ?? 0, fish.maxLength, fish.maxWeight)

			await storeNewFish(user, fish.id, xp)

			const userAfterFish = await getUserById(user._id)

			const stats = getStats(userAfterFish!.fishesIds)

			const replyMessage = {
				fish: `🐠 ${user.name} pescou um(a) *${fish.name}* de *${fish.weight / 1000}kg* com uma ${user.rod.name} ${user.rod.emoji}!`,
				rarity: `⭐ Esse é um peixe *${fish.rarity.category}*`,
				xp: `📈 Você ganhou *${xp}* pontos de xp!`,
				total: `> 🐟 Você já pescou ${stats.userTotal} de ${stats.total} peixes`,
				rarestFish: stats.rarestFish
					? `\n> 💎 Seu peixe mais raro é um(a) *${stats.rarestFish.name}* (${stats.rarestFish.rarity.category})`
					: '',
				heavierFish: stats.heavierFish
					? `\n> 🏆 Seu peixe mais pesado é um(a) *${stats.heavierFish.name}* de *${stats.heavierFish.weight / 1000}kg*!`
					: '',
				remainXp: `> 👤 Faltam ${getXPForNextRod(userAfterFish!.rod, userAfterFish!.xp)} pontos de xp para o próximo nível`,
				baits: `> 🐛 Você tem *${userAfterFish!.baits}* iscas disponíveis`,
				remainTimeToNextBait:
					baits - 1 < 5
						? `> ⏳ Próxima isca em *${formatRemainingTime(remainTimeToNextBait)}*`
						: '',
				levelUp: '',
			}

			if (isLevelingUp(user.rod, user.xp + xp)) {
				const newRod = await handleLevelUp(user)

				replyMessage.levelUp = `\n\n🎉 Parabéns! Você subiu de nível e ganhou uma ${newRod.name} ${newRod.emoji}`
				replyMessage.remainXp = ''
			}

			message.reply(
				replyMessage.fish +
					'\n\n' +
					replyMessage.rarity +
					'\n\n' +
					replyMessage.xp +
					'\n\n' +
					replyMessage.remainXp +
					'\n' +
					replyMessage.total +
					replyMessage.rarestFish +
					replyMessage.heavierFish +
					'\n' +
					replyMessage.baits +
					'\n' +
					replyMessage.remainTimeToNextBait +
					replyMessage.levelUp,
			)
		}

		if (trash) {
			message.reply(
				`Você pescou um(a) ${trash.name} ${trash.emoji}. ${trash.description}`,
			)
		}
	} else {
		message.reply(
			`Você tá sem isca troxão! Vai caçar o que fazer da vida porque a próxima é só em ${formatRemainingTime(remainTimeToNextBait)} ⏳`,
		)
	}
}
