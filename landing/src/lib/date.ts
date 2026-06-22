export function formatLocalDate(date: Date) {
	const year = date.getFullYear()
	const month = String(date.getMonth() + 1).padStart(2, '0')
	const day = String(date.getDate()).padStart(2, '0')

	return `${year}-${month}-${day}`
}

export function parseLocalDate(date: string) {
	const [year, month, day] = date.split('-').map(Number)
	return new Date(year, month - 1, day)
}

export function getMondayOfWeek(date: string) {
	const localDate = parseLocalDate(date)
	localDate.setDate(localDate.getDate() - ((localDate.getDay() + 6) % 7))
	return formatLocalDate(localDate)
}