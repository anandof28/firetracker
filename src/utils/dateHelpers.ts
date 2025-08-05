// Utility functions for date handling

/**
 * Convert a Date object to YYYY-MM-DD string format
 */
export const formatDateForInput = (date: Date | null): string => {
  if (!date) return ''
  return date.toISOString().split('T')[0]
}

/**
 * Convert a YYYY-MM-DD string to Date object
 */
export const parseDateFromInput = (dateString: string): Date | null => {
  if (!dateString) return null
  return new Date(dateString)
}

/**
 * Format date for display (DD/MM/YYYY)
 */
export const formatDateForDisplay = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  if (!dateObj || isNaN(dateObj.getTime())) return ''
  
  return dateObj.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
}

/**
 * Get today's date as Date object
 */
export const getToday = (): Date => {
  return new Date()
}

/**
 * Get date N days from today
 */
export const getDateDaysFromNow = (days: number): Date => {
  const date = new Date()
  date.setDate(date.getDate() + days)
  return date
}

/**
 * Check if a date is in the past
 */
export const isDateInPast = (date: Date | string): boolean => {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  dateObj.setHours(0, 0, 0, 0)
  return dateObj < today
}

/**
 * Check if a date is in the future
 */
export const isDateInFuture = (date: Date | string): boolean => {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  dateObj.setHours(0, 0, 0, 0)
  return dateObj > today
}

/**
 * Calculate days between two dates
 */
export const daysBetween = (date1: Date | string, date2: Date | string): number => {
  const d1 = typeof date1 === 'string' ? new Date(date1) : date1
  const d2 = typeof date2 === 'string' ? new Date(date2) : date2
  const diffTime = Math.abs(d2.getTime() - d1.getTime())
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
}
