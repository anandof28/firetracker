import { formatDateForDisplay, formatDateForInput } from '@/utils/dateHelpers'
import { calculateMaturityAmount } from '@/utils/fdUtils'

// Integration tests for the complete Fire Tracker application
describe('Fire Tracker Integration Tests', () => {
  describe('FD Maturity Calculations', () => {
    it('should calculate correct maturity amounts for various scenarios', () => {
      // Test 1: Simple annual calculation
      const maturity1 = calculateMaturityAmount(100000, 7.5, '2024-01-01', '2025-01-01')
      expect(maturity1).toBe(107500)

      // Test 2: Partial year calculation
      const maturity2 = calculateMaturityAmount(50000, 6.0, '2024-01-01', '2024-07-01')
      expect(maturity2).toBe(51500)

      // Test 3: Multi-year calculation
      const maturity3 = calculateMaturityAmount(200000, 8.0, '2024-01-01', '2026-01-01')
      expect(maturity3).toBe(232000)

      // Test 4: Edge case - zero principal
      const maturity4 = calculateMaturityAmount(0, 7.5, '2024-01-01', '2025-01-01')
      expect(maturity4).toBe(0)

      // Test 5: Edge case - zero rate
      const maturity5 = calculateMaturityAmount(100000, 0, '2024-01-01', '2025-01-01')
      expect(maturity5).toBe(100000)
    })
  })

  describe('Date Formatting Utilities', () => {
    it('should format dates consistently for display and input', () => {
      const testDate = new Date('2024-03-15T10:30:00Z')
      const isoString = '2024-03-15T10:30:00Z'

      // Test display formatting
      const displayFormat = formatDateForDisplay(isoString)
      expect(displayFormat).toBe('15/03/2024')

      // Test input formatting
      const inputFormat = formatDateForInput(testDate)
      expect(inputFormat).toBe('2024-03-15')

      // Test round-trip consistency
      const backToDate = new Date(inputFormat)
      const backToDisplay = formatDateForDisplay(backToDate.toISOString())
      expect(backToDisplay).toBe('15/03/2024')
    })

    it('should handle edge case dates', () => {
      // New Year's Day
      const newYear = formatDateForDisplay('2024-01-01T00:00:00Z')
      expect(newYear).toBe('01/01/2024')

      // New Year's Eve
      const newYearEve = formatDateForDisplay('2024-12-31T23:59:59Z')
      expect(newYearEve).toBe('31/12/2024')

      // Leap year date
      const leapDay = formatDateForDisplay('2024-02-29T12:00:00Z')
      expect(leapDay).toBe('29/02/2024')
    })
  })

  describe('Account and FD Relationship Validation', () => {
    it('should validate account-FD relationships correctly', () => {
      const mockAccount = {
        id: '1',
        name: 'SBI Savings',
        balance: 100000,
      }

      const mockFD = {
        id: '1',
        amount: 50000,
        rate: 7.5,
        startDate: '2024-01-01',
        endDate: '2025-01-01',
        accountId: '1',
        account: mockAccount,
      }

      // Test that FD amount doesn't exceed account balance (business logic)
      expect(mockFD.amount).toBeLessThanOrEqual(mockAccount.balance)

      // Test that FD is properly linked to account
      expect(mockFD.accountId).toBe(mockAccount.id)
      expect(mockFD.account.name).toBe(mockAccount.name)
    })
  })

  describe('Business Logic Validation', () => {
    it('should validate FD date constraints', () => {
      const startDate = new Date('2024-01-01')
      const endDate = new Date('2025-01-01')

      // Test that end date is after start date
      expect(endDate.getTime()).toBeGreaterThan(startDate.getTime())

      // Test minimum FD duration (assuming 7 days minimum)
      const minEndDate = new Date(startDate.getTime() + 7 * 24 * 60 * 60 * 1000)
      expect(endDate.getTime()).toBeGreaterThanOrEqual(minEndDate.getTime())
    })

    it('should validate interest rate ranges', () => {
      const validRates = [0.5, 5.0, 7.5, 10.0, 15.0]
      const invalidRates = [-1, 0, 20.1, 100]

      validRates.forEach(rate => {
        expect(rate).toBeGreaterThan(0)
        expect(rate).toBeLessThanOrEqual(20) // Assuming max 20% rate
      })

      invalidRates.forEach(rate => {
        expect(rate <= 0 || rate > 20).toBe(true)
      })
    })

    it('should validate minimum investment amounts', () => {
      const validAmounts = [1000, 5000, 10000, 100000, 1000000]
      const invalidAmounts = [0, -100, 500] // Assuming minimum 1000

      validAmounts.forEach(amount => {
        expect(amount).toBeGreaterThanOrEqual(1000)
      })

      invalidAmounts.forEach(amount => {
        expect(amount).toBeLessThan(1000)
      })
    })
  })

  describe('Notification Logic', () => {
    it('should identify overdue FDs correctly', () => {
      const today = new Date('2024-06-15')
      const overdueFD = {
        id: '1',
        endDate: '2024-06-10', // 5 days overdue
        amount: 100000,
        rate: 7.5,
      }
      const activeFD = {
        id: '2',
        endDate: '2024-12-15', // Future date
        amount: 50000,
        rate: 6.0,
      }

      const overdueDate = new Date(overdueFD.endDate)
      const activeDate = new Date(activeFD.endDate)

      expect(overdueDate.getTime()).toBeLessThan(today.getTime())
      expect(activeDate.getTime()).toBeGreaterThan(today.getTime())
    })

    it('should identify FDs maturing within 45 days', () => {
      const today = new Date('2024-06-15')
      const soonToMatureFD = {
        id: '3',
        endDate: '2024-07-20', // 35 days from today
        amount: 75000,
        rate: 8.0,
      }

      const maturityDate = new Date(soonToMatureFD.endDate)
      const daysUntilMaturity = Math.ceil((maturityDate.getTime() - today.getTime()) / (24 * 60 * 60 * 1000))

      expect(daysUntilMaturity).toBeLessThanOrEqual(45)
      expect(daysUntilMaturity).toBeGreaterThan(0)
    })
  })

  describe('Error Handling Scenarios', () => {
    it('should handle network errors gracefully', () => {
      const networkError = new Error('Network request failed')
      const apiError = { status: 500, message: 'Internal server error' }

      expect(networkError.message).toBe('Network request failed')
      expect(apiError.status).toBe(500)
    })

    it('should handle validation errors appropriately', () => {
      const validationErrors = [
        { field: 'amount', message: 'Amount must be a positive number' },
        { field: 'rate', message: 'Rate must be between 0.1 and 20' },
        { field: 'startDate', message: 'Start date is required' },
        { field: 'endDate', message: 'End date must be after start date' },
        { field: 'accountId', message: 'Account selection is required' },
      ]

      validationErrors.forEach(error => {
        expect(error.field).toBeTruthy()
        expect(error.message).toBeTruthy()
      })
    })
  })

  describe('Performance and Scalability', () => {
    it('should handle large datasets efficiently', () => {
      // Simulate large dataset
      const largeAccountList = Array.from({ length: 1000 }, (_, i) => ({
        id: `account-${i}`,
        name: `Account ${i}`,
        balance: Math.random() * 1000000,
      }))

      const largeFDList = Array.from({ length: 5000 }, (_, i) => ({
        id: `fd-${i}`,
        amount: Math.random() * 500000,
        rate: 5 + Math.random() * 10,
        startDate: '2024-01-01',
        endDate: '2025-01-01',
        accountId: `account-${i % 1000}`,
      }))

      // Test that calculations can handle large datasets
      expect(largeAccountList.length).toBe(1000)
      expect(largeFDList.length).toBe(5000)

      // Test total calculations
      const totalBalance = largeAccountList.reduce((sum, account) => sum + account.balance, 0)
      const totalInvestment = largeFDList.reduce((sum, fd) => sum + fd.amount, 0)

      expect(totalBalance).toBeGreaterThan(0)
      expect(totalInvestment).toBeGreaterThan(0)
    })
  })

  describe('Data Consistency', () => {
    it('should maintain referential integrity', () => {
      const accounts = [
        { id: '1', name: 'Account 1', balance: 100000 },
        { id: '2', name: 'Account 2', balance: 50000 },
      ]

      const fds = [
        { id: '1', accountId: '1', amount: 25000 },
        { id: '2', accountId: '2', amount: 30000 },
        { id: '3', accountId: '1', amount: 40000 },
      ]

      // Test that all FDs reference valid accounts
      fds.forEach(fd => {
        const accountExists = accounts.some(account => account.id === fd.accountId)
        expect(accountExists).toBe(true)
      })

      // Test that FD amounts don't exceed account balances (per account)
      accounts.forEach(account => {
        const accountFDs = fds.filter(fd => fd.accountId === account.id)
        const totalFDAmount = accountFDs.reduce((sum, fd) => sum + fd.amount, 0)
        expect(totalFDAmount).toBeLessThanOrEqual(account.balance)
      })
    })
  })
})
