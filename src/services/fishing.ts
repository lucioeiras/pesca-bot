import type { Contact } from 'whatsapp-web.js'

import { Baits } from '../models/baits'
import { Fish } from '../models/fish'
import { Rod } from '../models/rod'
import User from '../models/user'
import { XP } from '../models/xp'

import { formatRemainingTime } from '../utils/formatRemainingTime'

import type { User as UserType } from '../types/user'

type FishingProps = {
	contact: Contact
	senderId: string
	isFromMe: boolean
}

export const fishing = async ({
	contact,
	senderId,
	isFromMe,
}: FishingProps): Promise<string> => {
	let user: UserType | null

	if (isFromMe) {
		user = await User.findByNumber('5535998974580')
	} else {
		user = await User.findByNumber(contact.number)
	}

	if (!user) {
		user = await User.store({ contact, senderId })
	}

	const baits = await Baits.available(user)

	if (baits > 0) {
		await Baits.update(user)

		const { fish, trash } = Fish.random(user!.rod)

		const userAfterFish = await User.findById(user._id)

		const remainTimeToNextBait = await Baits.time(userAfterFish!)
		const remainTimeToNextBaitFormatted =
			formatRemainingTime(remainTimeToNextBait)

		const totalStatus = Fish.findTotal(userAfterFish!.fishesIds)

		const stats = {
			userTotal: totalStatus.userTotal,
			total: totalStatus.total,
			rarestFish: Fish.findRarest(userAfterFish!.fishesIds),
			heavierFish: Fish.findHeavier(userAfterFish!.fishesIds),
		}
		const availableBaits = await Baits.available(userAfterFish!)

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
			remainXp: `\n> 👤 Faltam ${XP.next(userAfterFish!.rod, userAfterFish!.xp)} pontos de xp para o próximo nível`,
			baits: `> 🐛 Você tem *${availableBaits}* iscas disponíveis`,
			remainTimeToNextBait:
				availableBaits < 5
					? `\n> ⏳ Próxima isca em *${remainTimeToNextBaitFormatted}*`
					: '',
			levelUp: '',
		}

		if (fish) {
			const xp = XP.calculate(
				user.rod,
				fish.rarity?.score ?? 0,
				fish.weight,
				fish.maxLength,
			)

			await User.update({
				...userAfterFish!,
				xp: userAfterFish!.xp + xp,
				fishesIds: [...userAfterFish!.fishesIds, fish.id],
			})

			if (XP.verify(user.rod, user.xp + xp)) {
				const newRod = Rod.findNext(userAfterFish!.rod)!

				await XP.levelUp(userAfterFish!, newRod)

				replyMessage.levelUp = `\n\n🎉 Parabéns! Você subiu de nível e ganhou uma ${newRod.name} ${newRod.emoji}`
				replyMessage.remainXp = ''
			}

			replyMessage.fish = `🐠 ${user.name} pescou um(a) *${fish.name}* de *${fish.weight / 1000}kg* com uma ${user.rod.name} ${user.rod.emoji}!`
			replyMessage.rarity = `⭐ Esse é um peixe *${fish.rarity.category}*`
			replyMessage.xp = `📈 Você ganhou *${xp}* pontos de xp!`

			return (
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
				replyMessage.remainTimeToNextBait +
				replyMessage.levelUp
			)
		} else {
			replyMessage.trash = `${user.name} pescou um(a) *${trash!.name}* ${trash!.emoji}. ${trash!.description}`

			return (
				replyMessage.trash +
				'\n' +
				replyMessage.remainXp +
				'\n' +
				replyMessage.total +
				replyMessage.rarestFish +
				replyMessage.heavierFish +
				'\n' +
				replyMessage.baits +
				replyMessage.remainTimeToNextBait +
				replyMessage.levelUp
			)
		}
	} else {
		const remainTimeToNextBait = await Baits.time(user)
		const remainTimeToNextBaitFormatted =
			formatRemainingTime(remainTimeToNextBait)

		return `Você tá sem isca troxão! Vai caçar o que fazer da vida porque a próxima é só em ${remainTimeToNextBaitFormatted} ⏳`
	}
}
