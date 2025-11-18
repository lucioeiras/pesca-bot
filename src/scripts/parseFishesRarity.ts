import 'dotenv/config'
import type { Fish } from '../types/fish'
import { connectToDatabase, collections } from '../config/db'

const getRarity = ({
	vulnerability,
	maxLength,
	commonLength,
	weight,
	abundance,
}: Fish): { score: number; category: string } => {
	// If abundance information is provided, use only it to derive score/category
	if (abundance && abundance.trim().length > 0) {
		let abundanceScore = 0.5
		const a = abundance.toLowerCase()
		if (a.includes('abundant')) abundanceScore = 0.16
		else if (a.includes('common')) abundanceScore = 0.32
		else if (a.includes('uncommon')) abundanceScore = 0.5
		else if (a.includes('rare')) abundanceScore = 0.7
		else if (a.includes('very rare')) abundanceScore = 0.85
		else if (a.includes('scarce')) abundanceScore = 1

		const score = Math.min(Math.max(abundanceScore, 0), 1)

		let category: string
		if (score <= 0.16) category = 'Comum'
		else if (score <= 0.32) category = 'Incomum'
		else if (score <= 0.5) category = 'Raro'
		else if (score <= 0.7) category = 'Muito Raro'
		else if (score <= 0.85) category = 'Épico'
		else category = 'Lendário'

		return { score, category }
	}

	const vScore =
		vulnerability !== null && vulnerability !== undefined
			? vulnerability / 100
			: 0
	const lengthScore = maxLength ? Math.min(maxLength / 300, 1) : 0
	const commonLengthScore = commonLength ? Math.min(commonLength / 300, 1) : 0
	const weightScore = weight ? Math.min(weight / 1000000, 1) : 0

	const weightVulnerability = 0.4
	const weightSize = 0.3
	const sizeScore = (lengthScore + commonLengthScore + weightScore) / 3

	// Abundance not provided: renormalize weights to exclude abundance
	const totalWeight = weightVulnerability + weightSize
	const wV = totalWeight > 0 ? weightVulnerability / totalWeight : 0.5
	const wS = totalWeight > 0 ? weightSize / totalWeight : 0.5

	const rarity = vScore * wV + sizeScore * wS

	const score = Math.min(Math.max(rarity, 0), 1)

	let category: string
	if (score <= 0.16) category = 'Comum'
	else if (score <= 0.32) category = 'Incomum'
	else if (score <= 0.5) category = 'Raro'
	else if (score <= 0.7) category = 'Muito Raro'
	else if (score <= 0.85) category = 'Épico'
	else category = 'Lendário'

	return { score, category }
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
				update: { $set: { rarity: getRarity(fish) } },
			},
		}))

		const result = await collections.fishes!.bulkWrite(operations)

		console.log(
			`Raridade atualizada para ${operations.length} peixes. Matched: ${result.matchedCount}, Modified: ${result.modifiedCount}`,
		)
	} catch (err) {
		console.error('Falha ao atualizar raridade dos peixes:', err)
		process.exitCode = 1
	}
}

await run()
