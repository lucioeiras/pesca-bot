import { Fish } from '../models/fish'
import { User } from '../models/user'
import { getEmojiByNumber } from '../utils/getEmojiByNumber'

export const getHeavierRank = async (): Promise<string> => {
	const users = await User.index()

	const usersWithFish = await Promise.all(
		users.map(async (user) => ({
			...user,
			heaviestFish: await Fish.findHeavier(user.fishesIds),
		})),
	)

	const sortedUsers = usersWithFish.sort((a, b) => {
		const aHeaviest = a.heaviestFish?.weight ?? 0
		const bHeaviest = b.heaviestFish?.weight ?? 0

		return bHeaviest - aHeaviest
	})

	const replyMessage = {
		header: '🏆 Rank dos peixes mais pesados\n',
		rank: sortedUsers.map(
			(user, index) =>
				index < 10 &&
				`\n${getEmojiByNumber(index)}. ${user.name}: ${user.heaviestFish?.name} de *${user.heaviestFish ? user.heaviestFish.weight / 1000 : 0}kg*`,
		),
	}

	return replyMessage.header + replyMessage.rank.filter(Boolean).join('')
}

export const getRarestRank = async (): Promise<string> => {
	const users = await User.index()

	const usersWithFish = await Promise.all(
		users.map(async (user) => ({
			...user,
			rarestFish: await Fish.findRarest(user.fishesIds),
		})),
	)

	const sortedUsers = usersWithFish.sort((a, b) => {
		const aRarest = a.rarestFish?.rarity.score ?? 0
		const bRarest = b.rarestFish?.rarity.score ?? 0

		return bRarest - aRarest
	})

	const replyMessage = {
		header: '💎 Rank dos peixes mais raros\n',
		rank: sortedUsers.map(
			(user, index) =>
				index < 10 &&
				`\n${getEmojiByNumber(index)}. ${user.name}: ${user.rarestFish?.name} (*${user.rarestFish?.rarity.category}*)`,
		),
	}

	return replyMessage.header + replyMessage.rank.filter(Boolean).join('')
}

export const getTotalFishRank = async (): Promise<string> => {
	const users = await User.index()

	const usersWithFish = await Promise.all(
		users.map(async (user) => ({
			...user,
			userTotal: (await Fish.findTotal(user.fishesIds)).userTotal,
		})),
	)

	const sortedUsers = usersWithFish.sort((a, b) => {
		const aTotal = a.userTotal ?? 0
		const bTotal = b.userTotal ?? 0

		return bTotal - aTotal
	})

	const replyMessage = {
		header: '🎣 Rank de peixes (diferentes) pescados\n',
		rank: sortedUsers.map(
			(user, index) =>
				index < 10 &&
				`\n${getEmojiByNumber(index)}. ${user.name}: ${user.userTotal} peixe(s)`,
		),
	}

	return replyMessage.header + replyMessage.rank.filter(Boolean).join('')
}
