export const getWeightWithComma = (weightInGrams: number): string => {
	const weightInKg = weightInGrams / 1000
	return weightInKg.toFixed(1).replace('.', ',')
}
