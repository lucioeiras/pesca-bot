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
