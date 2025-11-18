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

	if (baits > 0) {
		const { fish, trash } = getRandomFish(user!.rod)

		const userAfterFish = await getUserById(user._id)
		const remainTimeToNextBait = timeUntilNextBait(userAfterFish!)
		const stats = getStats(userAfterFish!.fishesIds)
		const availableBaits = userAfterFish!.baitSlots.filter(
			(slot) => slot === 0,
		).length

		const replyMessage = {
			fish: '',
			rarity: '',
			xp: '',

			trash: '',

			total: `> 🐟 Você já pescou ${stats.userTotal} de ${stats.total} peixes`,
			rarestFish: stats.rarestFish
				? `\n> 💎 Seu peixe mais raro é um(a) *${stats.rarestFish.name}* (${stats.rarestFish.rarity.category})`
				: '',
			heavierFish: stats.heavierFish
				? `\n> 🏆 Seu peixe mais pesado é um(a) *${stats.heavierFish.name}* de *${stats.heavierFish.weight / 1000}kg*!`
				: '',
			remainXp: `\n> 👤 Faltam ${getXPForNextRod(userAfterFish!.rod, userAfterFish!.xp)} pontos de xp para o próximo nível`,
			baits: `> 🐛 Você tem *${availableBaits}* iscas disponíveis`,
			remainTimeToNextBait:
				availableBaits < 5
					? `> ⏳ Próxima isca em *${formatRemainingTime(remainTimeToNextBait)}*`
					: '',
			levelUp: '',
		}

		if (fish) {
			const xp = getXP(
				user.rod,
				fish.rarity?.score ?? 0,
				fish.weight,
				fish.maxLength,
			)

			await storeNewFish(user, fish.id, xp)

			if (isLevelingUp(user.rod, user.xp + xp)) {
				const newRod = await handleLevelUp(userAfterFish!)

				replyMessage.levelUp = `\n\n🎉 Parabéns! Você subiu de nível e ganhou uma ${newRod.name} ${newRod.emoji}`
				replyMessage.remainXp = ''
			}

			replyMessage.fish = `🐠 ${user.name} pescou um(a) *${fish.name}* de *${fish.weight / 1000}kg* com uma ${user.rod.name} ${user.rod.emoji}!`
			replyMessage.rarity = `⭐ Esse é um peixe *${fish.rarity.category}*`
			replyMessage.xp = `📈 Você ganhou *${xp}* pontos de xp!`

			message.reply(
				replyMessage.fish +
					'\n\n' +
					replyMessage.rarity +
					'\n\n' +
					replyMessage.xp +
					'\n' +
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
			replyMessage.trash = `${user.name} pescou um(a) *${trash.name}* ${trash.emoji}. ${trash.description}`

			message.reply(
				replyMessage.trash +
					'\n' +
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
	} else {
		const remainTimeToNextBait = timeUntilNextBait(user)

		message.reply(
			`Você tá sem isca troxão! Vai caçar o que fazer da vida porque a próxima é só em ${formatRemainingTime(remainTimeToNextBait)} ⏳`,
		)
	}
}
