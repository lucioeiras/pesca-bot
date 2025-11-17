import type { Message } from 'whatsapp-web.js'

import { collections } from '../config/db'

import { getFish } from './getFish'
import { getXP } from './getXP'

import type User from '../models/user'

type PlayProps = {
	user: User
	message: Message
}

export const play = async ({ user, message }: PlayProps) => {
	const { fish, trash } = getFish(user!.rod)

	if (fish) {
		const xp = getXP(fish.rarity?.score ?? 0, fish.maxLength, fish.maxWeight)

		await collections.users?.updateOne(
			{
				_id: user._id,
			},
			{
				$set: {
					fishesIds: [...user?.fishesIds, fish.id],
					xp: user?.xp + xp,
					baits: user?.baits - 1,
				},
			},
		)

		message.reply(
			`🐠 Você pescou um(a) ${fish.name} de ${fish.weight / 1000}kg!\n⭐ Esse é um peixe ${fish.rarity.category}\n📈Você ganhou ${xp} pontos de xp!\nSua vara atual é ${user.rod.name} ${user.rod.emoji}`,
		)
	}

	if (trash) {
		message.reply(
			`Você pescou um(a) ${trash.name} ${trash.emoji}. ${trash.description}`,
		)
	}
}
