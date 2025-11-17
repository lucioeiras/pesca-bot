import { ObjectId, UUID } from 'mongodb'

import type { Rod } from '../types/rod'

export default class User {
	constructor(
		public _id: ObjectId,
		public name: string,
		public number: string,
		public rod: Rod,
		public xp: number,
		public fishesIds: UUID[],
		public baits: number,
	) {}
}
