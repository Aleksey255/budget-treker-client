export const formatDateForQuery = (
  date: Date | null,
  isEndDate: boolean
): string | null => {
  if (!date) return null
  const formattedDate = new Date(date)
  formattedDate.setHours(
    isEndDate ? 23 : 0,
    isEndDate ? 59 : 0,
    isEndDate ? 59 : 0,
    isEndDate ? 999 : 0
  )
  return formattedDate.toISOString()
}
