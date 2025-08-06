import { calculateMaturityAmount } from '../fdUtils'

describe('fdUtils', () => {
  describe('calculateMaturityAmount', () => {
    it('should calculate maturity amount for 1 year FD', () => {
      const principal = 100000
      const rate = 7.5
      const startDate = '2024-01-01'
      const endDate = '2025-01-01'
      
      const result = calculateMaturityAmount(principal, rate, startDate, endDate)
      
      // Expected: Compound interest: 100000 * Math.pow(1.075, 1.0027) ≈ 107515.97
      expect(result).toBeCloseTo(107516, 0)
    })

    it('should calculate maturity amount for 6 months FD', () => {
      const principal = 50000
      const rate = 6.0
      const startDate = '2024-01-01'
      const endDate = '2024-07-01'
      
      const result = calculateMaturityAmount(principal, rate, startDate, endDate)
      
      // Expected: Compound interest for ~0.497 years: 50000 * Math.pow(1.06, 0.497) ≈ 51473
      expect(result).toBeCloseTo(51473, 0)
    })

    it('should calculate maturity amount for 2 years FD', () => {
      const principal = 200000
      const rate = 8.0
      const startDate = '2024-01-01'
      const endDate = '2026-01-01'
      
      const result = calculateMaturityAmount(principal, rate, startDate, endDate)
      
      // Expected: Compound interest for 2 years: 200000 * Math.pow(1.08, 2.0055) ≈ 233305
      expect(result).toBeCloseTo(233305, 0)
    })

    it('should handle different date formats', () => {
      const principal = 75000
      const rate = 5.5
      const startDate = '2024-03-15T00:00:00.000Z'
      const endDate = '2025-03-15T00:00:00.000Z'
      
      const result = calculateMaturityAmount(principal, rate, startDate, endDate)
      
      // Expected: Compound interest for 1 year: 75000 * Math.pow(1.055, 1.0027) ≈ 79122
      expect(result).toBeCloseTo(79122, 0)
    })

    it('should handle fractional years correctly', () => {
      const principal = 100000
      const rate = 7.0
      const startDate = '2024-01-01'
      const endDate = '2024-04-01' // 3 months = 0.25 years
      
      const result = calculateMaturityAmount(principal, rate, startDate, endDate)
      
      // Expected: Compound interest for ~0.247 years: 100000 * Math.pow(1.07, 0.247) ≈ 101700
      expect(result).toBeCloseTo(101700, 0)
    })

    it('should handle zero principal amount', () => {
      const principal = 0
      const rate = 7.5
      const startDate = '2024-01-01'
      const endDate = '2025-01-01'
      
      const result = calculateMaturityAmount(principal, rate, startDate, endDate)
      
      expect(result).toBe(0)
    })

    it('should handle zero interest rate', () => {
      const principal = 100000
      const rate = 0
      const startDate = '2024-01-01'
      const endDate = '2025-01-01'
      
      const result = calculateMaturityAmount(principal, rate, startDate, endDate)
      
      expect(result).toBe(100000)
    })
  })
})
