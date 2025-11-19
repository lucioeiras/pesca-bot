import { Baits } from '../models/baits'
import { Fish } from '../models/fish'
import { Rod } from '../models/rod'
import { User } from '../models/user'
import { XP } from '../models/xp'

import { formatRemainingTime } from '../utils/formatRemainingTime'

import type { User as UserType } from '../types/user'

export const fishing = async (user: UserType): Promise<string> => {
	const baits = await Baits.available(user)

	if (baits > 0) {
		await Baits.update(user)

		// Busca o usuário atualizado após consumir a isca
		const userAfterBaitUpdate = await User.findById(user._id)

		const { fish, trash } = await Fish.random(userAfterBaitUpdate!.rod)!

		const userAfterFish = await User.findById(user._id)

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

			const userAfterStore = await User.findById(user._id)

			const remainTimeToNextBait = await Baits.time(userAfterStore!)
			const remainTimeToNextBaitFormatted =
				formatRemainingTime(remainTimeToNextBait)

			const totalStatus = await Fish.findTotal(userAfterStore!.fishesIds)
			const stats = {
				userTotal: totalStatus.userTotal,
				total: totalStatus.total,
				rarestFish: await Fish.findRarest(userAfterStore!.fishesIds),
				heavierFish: await Fish.findHeavier(userAfterStore!.fishesIds),
			}
			const availableBaits = await Baits.available(userAfterStore!)

			const replyMessage = {
				fish: `🐠 ${user.name} pescou um(a) *${fish.name}* de *${fish.weight / 1000}kg* com uma ${user.rod.name} ${user.rod.emoji}!`,
				rarity: `\n\n⭐ Esse é um peixe *${fish.rarity.category}*`,
				xp: `\n\n📈 Você ganhou *${xp}* pontos de xp!`,
				remainXp: `\n\n> 👤 Faltam ${XP.next(userAfterStore!.rod, userAfterStore!.xp)} pontos de xp para o próximo nível`,
				total: `\n> 🐟 Você já pescou ${stats.userTotal} de ${stats.total} peixes`,
				rarestFish: stats.rarestFish
					? `\n> 💎 Seu peixe mais raro é um(a) *${stats.rarestFish.name}* (${stats.rarestFish.rarity.category})`
					: '',
				heavierFish: stats.heavierFish
					? `\n\n> 🏆 Seu peixe mais pesado é um(a) *${stats.heavierFish.name}* de *${stats.heavierFish.weight / 1000}kg*!`
					: '',
				baits: `> 🐛 Você tem *${availableBaits}* iscas disponíveis`,
				remainTimeToNextBait:
					availableBaits < 5
						? `\n> ⏳ Próxima isca em *${remainTimeToNextBaitFormatted}*`
						: '',
				levelUp: '',
			}

			if (await XP.verify(user.rod, user.xp + xp)) {
				const newRod = await Rod.findNext(userAfterFish!.rod)!

				await XP.levelUp(userAfterFish!, newRod!)

				replyMessage.levelUp = `\n\n🎉 Parabéns! Você subiu de nível e ganhou uma ${newRod!.name} ${newRod!.emoji}`
				replyMessage.remainXp = `\n\n> 👤 Faltam ${newRod?.xpNext} pontos de xp para o próximo nível`
			}

			return (
				replyMessage.fish +
				replyMessage.rarity +
				replyMessage.xp +
				replyMessage.remainXp +
				replyMessage.total +
				replyMessage.rarestFish +
				replyMessage.heavierFish +
				replyMessage.baits +
				replyMessage.remainTimeToNextBait +
				replyMessage.levelUp
			)
		} else {
			// Busca stats também quando pescar lixo
			const remainTimeToNextBait = await Baits.time(userAfterFish!)
			const remainTimeToNextBaitFormatted =
				formatRemainingTime(remainTimeToNextBait)

			const totalStatus = await Fish.findTotal(userAfterFish!.fishesIds)

			const stats = {
				userTotal: totalStatus.userTotal,
				total: totalStatus.total,
				rarestFish: await Fish.findRarest(userAfterFish!.fishesIds),
				heavierFish: await Fish.findHeavier(userAfterFish!.fishesIds),
			}
			const availableBaits = await Baits.available(userAfterFish!)

			const replyMessage = {
				trash: `${user.name} pescou um(a) *${trash!.name}* ${trash!.emoji}. ${trash!.description}`,
				remainXp: `\n\n> 👤 Faltam ${XP.next(userAfterFish!.rod, userAfterFish!.xp)} pontos de xp para o próximo nível`,
				total: `\n> 🐟 Você já pescou ${stats.userTotal} de ${stats.total} peixes`,
				rarestFish: stats.rarestFish
					? `\n> 💎 Seu peixe mais raro é um(a) *${stats.rarestFish.name}* (${stats.rarestFish.rarity.category})`
					: '',
				heavierFish: stats.heavierFish
					? `\n> 🏆 Seu peixe mais pesado é um(a) *${stats.heavierFish.name}* de *${stats.heavierFish.weight / 1000}kg*!`
					: '',
				baits: `\n> 🐛 Você tem *${availableBaits}* iscas disponíveis`,
				remainTimeToNextBait:
					availableBaits < 5
						? `\n> ⏳ Próxima isca em *${remainTimeToNextBaitFormatted}*`
						: '',
			}

			return (
				replyMessage.trash +
				replyMessage.remainXp +
				replyMessage.total +
				replyMessage.rarestFish +
				replyMessage.heavierFish +
				replyMessage.baits +
				replyMessage.remainTimeToNextBait
			)
		}
	} else {
		const remainTimeToNextBait = await Baits.time(user)
		const remainTimeToNextBaitFormatted =
			formatRemainingTime(remainTimeToNextBait)

		return `Você tá sem isca troxão! Vai caçar o que fazer da vida porque a próxima é só em ${remainTimeToNextBaitFormatted} ⏳`
	}
}
