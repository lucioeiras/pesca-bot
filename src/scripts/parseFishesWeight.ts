import 'dotenv/config'
import { connectToDatabase, collections } from '../config/db'
import type { Fish } from '../types/fish'

const getWeight = (maxLength: number): number => {
	if (!maxLength) {
		maxLength = 50 + Math.floor(Math.random() * 150) // comprimento aleatório entre 30 e 100 cm
	}

	const weight = Math.round(0.1 * Math.pow(maxLength, 3))

	if (weight < 10) return 10

	return weight
}

const run = async () => {
	try {
		await connectToDatabase()

		const fishes = (await collections
			.fishes!.find({})
			.toArray()) as unknown as Fish[]

		if (!fishes.length) {
			console.log('Nenhum peixe encontrado na coleção.')
			return
		}

		const operations = fishes.map((fish) => ({
			updateOne: {
				filter: { id: fish.id },
				update: { $set: { weight: getWeight(fish.maxLength) } },
			},
		}))

		const result = await collections.fishes!.bulkWrite(operations)

		console.log(
			`Peso atualizado para ${operations.length} peixes. Matched: ${result.matchedCount}, Modified: ${result.modifiedCount}`,
		)
	} catch (err) {
		console.error('Falha ao atualizar peso dos peixes:', err)
		process.exitCode = 1
	}
}

await run()
