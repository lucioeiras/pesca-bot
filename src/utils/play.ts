import type { Message } from 'whatsapp-web.js'

import type User from '../models/user'
import { getRandomFish } from '../models/fish'
import { getXP, getXPForNextRod, isLevelingUp } from '../models/rod'
import { handleLevelUp, storeNewFish } from '../models/user'

type PlayProps = {
	user: User
	message: Message
}

export const play = async ({ user, message }: PlayProps) => {
	const { fish, trash } = getRandomFish(user!.rod)

	if (fish) {
		const xp = getXP(fish.rarity?.score ?? 0, fish.maxLength, fish.maxWeight)

		await storeNewFish(user, fish.id, xp)

		const replyMessage = {
			fish: `🐠 ${user.name} pescou um(a) ${fish.name} de ${fish.weight / 1000}kg!`,
			rarity: `⭐ Esse é um peixe ${fish.rarity.category}`,
			xp: `📈 Você ganhou ${xp} pontos de xp!`,
			remainXp: ` Faltam ${getXPForNextRod(user.rod, user.xp + xp)} pontos de xp para o próximo nível`,
			rod: `${user.rod.emoji} Sua vara atual é ${user.rod.name}`,
		}

		if (isLevelingUp(user.rod, user.xp + xp)) {
			const newRod = await handleLevelUp(user)

			replyMessage.rod = `🎉 Parabéns! Você subiu de nível e ganhou uma ${newRod.name} ${newRod.emoji}`
			replyMessage.remainXp = ''
		}

		message.reply(
			replyMessage.fish +
				'\n\n' +
				replyMessage.rarity +
				'\n\n' +
				replyMessage.xp +
				replyMessage.remainXp +
				'\n\n' +
				replyMessage.rod,
		)
	}

	if (trash) {
		message.reply(
			`Você pescou um(a) ${trash.name} ${trash.emoji}. ${trash.description}`,
		)
	}
}
