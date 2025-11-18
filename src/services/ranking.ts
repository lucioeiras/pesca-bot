import { Fish } from '../models/fish'
import User from '../models/user'

export const getHeavierRank = async (): Promise<string> => {
	const users = await User.index()

	const sortedUsers = users
		.sort((a, b) => {
			const aHeaviest = Fish.findHeavier(a.fishesIds)?.weight ?? 0
			const bHeaviest = Fish.findHeavier(b.fishesIds)?.weight ?? 0

			return bHeaviest - aHeaviest
		})
		.map((user) => ({
			...user,
			heaviestFish: Fish.findHeavier(user.fishesIds) ?? null,
		}))

	const replyMessage = {
		header: '🏆 Rank dos peixes mais pesados',
		rank: sortedUsers.map(
			(user, index) =>
				index < 10 &&
				`\n${index + 1}. ${user.name}: ${user.heaviestFish?.name} de *${user.heaviestFish ? user.heaviestFish.weight / 1000 : 0}kg*`,
		),
	}

	return replyMessage.header + replyMessage.rank.filter(Boolean).join('')
}

export const getRarestRank = async (): Promise<string> => {
	const users = await User.index()

	const sortedUsers = users
		.sort((a, b) => {
			const aRarest = Fish.findRarest(a.fishesIds)?.rarity.score ?? 0
			const bRarest = Fish.findRarest(b.fishesIds)?.rarity.score ?? 0

			return bRarest - aRarest
		})
		.map((user) => ({
			...user,
			rarestFish: Fish.findRarest(user.fishesIds) ?? null,
		}))

	const replyMessage = {
		header: '💎 Rank dos peixes mais raros',
		rank: sortedUsers.map(
			(user, index) =>
				index < 10 &&
				`\n${index + 1}. ${user.name}: ${user.rarestFish?.name} (*${user.rarestFish?.rarity.category}*)`,
		),
	}

	return replyMessage.header + replyMessage.rank.filter(Boolean).join('')
}

export const getTotalFishRank = async (): Promise<string> => {
	const users = await User.index()

	const sortedUsers = users
		.sort((a, b) => {
			const aTotal = Fish.findTotal(a.fishesIds)?.userTotal ?? 0
			const bTotal = Fish.findTotal(b.fishesIds)?.userTotal ?? 0

			return bTotal - aTotal
		})
		.map((user) => ({
			...user,
			userTotal: Fish.findTotal(user.fishesIds).userTotal ?? null,
		}))

	const replyMessage = {
		header: '🎣 Rank de peixes (diferentes) pescados',
		rank: sortedUsers.map(
			(user, index) =>
				index < 10 &&
				`\n${index + 1}. ${user.name}: ${user.userTotal} peixe(s)`,
		),
	}

	return replyMessage.header + replyMessage.rank.filter(Boolean).join('')
}
