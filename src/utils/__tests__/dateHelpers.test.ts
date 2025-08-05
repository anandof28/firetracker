import { formatDateForDisplay, formatDateForInput } from '../dateHelpers'

describe('dateHelpers', () => {
  describe('formatDateForDisplay', () => {
    it('should format ISO date string to DD/MM/YYYY', () => {
      const isoDate = '2024-03-15T10:30:00.000Z'
      const result = formatDateForDisplay(isoDate)
      expect(result).toBe('15/03/2024')
    })

    it('should handle date without time', () => {
      const dateString = '2024-12-25'
      const result = formatDateForDisplay(dateString)
      expect(result).toBe('25/12/2024')
    })

    it('should handle different date formats', () => {
      const dateString = '2024-01-01T00:00:00Z'
      const result = formatDateForDisplay(dateString)
      expect(result).toBe('01/01/2024')
    })

    it('should handle edge cases with single digit dates', () => {
      const dateString = '2024-01-05T00:00:00Z'
      const result = formatDateForDisplay(dateString)
      expect(result).toBe('05/01/2024')
    })
  })

  describe('formatDateForInput', () => {
    it('should format Date object to YYYY-MM-DD', () => {
      const date = new Date('2024-03-15T10:30:00.000Z')
      const result = formatDateForInput(date)
      expect(result).toBe('2024-03-15')
    })

    it('should handle different Date objects', () => {
      const date = new Date('2024-12-25T23:59:59.999Z')
      const result = formatDateForInput(date)
      expect(result).toBe('2024-12-25')
    })

    it('should handle New Year date', () => {
      const date = new Date('2024-01-01T00:00:00.000Z')
      const result = formatDateForInput(date)
      expect(result).toBe('2024-01-01')
    })

    it('should pad single digit months and days', () => {
      const date = new Date('2024-01-05T00:00:00.000Z')
      const result = formatDateForInput(date)
      expect(result).toBe('2024-01-05')
    })
  })
})
