import { getStats } from './fish'
import { getAllUsers } from './user'

export const getHeavierRank = async () => {
	const users = await getAllUsers()

	const sortedUsers = users
		.sort((a, b) => {
			const aHeaviest = getStats(a.fishesIds).heavierFish?.weight ?? 0
			const bHeaviest = getStats(b.fishesIds).heavierFish?.weight ?? 0

			return bHeaviest - aHeaviest
		})
		.map((user) => ({
			...user,
			heaviestFish: getStats(user.fishesIds).heavierFish ?? null,
		}))

	return sortedUsers
}
