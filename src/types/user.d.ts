export type User = {
	_id: ObjectId
	name: string
	number: string
	rod: Rod
	xp: number
	fishesIds: UUID[]
	baitSlots: number[]
}
