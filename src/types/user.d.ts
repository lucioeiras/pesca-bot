import type { ObjectId, UUID } from 'mongodb'

import type { Rod } from './rod'

export type User = {
	_id: ObjectId
	name: string
	number: string
	rod: Rod
	xp: number
	fishesIds: UUID[]
	baitSlots: number[]
}
