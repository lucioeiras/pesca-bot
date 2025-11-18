export const formatRemainingTime = (ms: number): string => {
	const totalSeconds = Math.ceil(ms / 1000)
	const hours = Math.floor(totalSeconds / 3600)
	const minutes = Math.floor((totalSeconds % 3600) / 60)
	const seconds = totalSeconds % 60

	const parts: string[] = []
	if (hours > 0) parts.push(`${hours}h`)
	if (minutes > 0 || hours > 0) parts.push(`${minutes}min`)
	if (hours === 0) parts.push(`${seconds}s`)

	return parts.join(' ')
}
