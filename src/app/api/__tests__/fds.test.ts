import { NextRequest } from 'next/server'
import { GET, POST } from '../fds/route'

// Mock Prisma
const mockPrisma = {
  fD: {
    findMany: jest.fn(),
    create: jest.fn(),
  },
}

jest.mock('@/lib/prisma', () => ({
  __esModule: true,
  default: mockPrisma,
}))

describe('/api/fds', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('GET /api/fds', () => {
    it('should return all FDs with account information', async () => {
      const mockFDs = [
        {
          id: '1',
          amount: 100000,
          rate: 7.5,
          startDate: '2024-01-01',
          endDate: '2025-01-01',
          accountId: '1',
          account: { id: '1', name: 'SBI Savings', balance: 50000 },
          createdAt: new Date(),
        },
        {
          id: '2',
          amount: 50000,
          rate: 8.0,
          startDate: '2024-02-01',
          endDate: '2025-02-01',
          accountId: '2',
          account: { id: '2', name: 'HDFC Current', balance: 25000 },
          createdAt: new Date(),
        },
      ]

      mockPrisma.fD.findMany.mockResolvedValue(mockFDs)

      const response = await GET()
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toEqual(mockFDs)
      expect(mockPrisma.fD.findMany).toHaveBeenCalledWith({
        include: { account: true },
        orderBy: { createdAt: 'desc' },
      })
    })

    it('should handle database errors', async () => {
      mockPrisma.fD.findMany.mockRejectedValue(new Error('Database error'))

      const response = await GET()
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data).toEqual({ error: 'Failed to fetch FDs' })
    })
  })

  describe('POST /api/fds', () => {
    it('should create a new FD', async () => {
      const newFD = {
        id: '3',
        amount: 75000,
        rate: 6.5,
        startDate: '2024-03-01',
        endDate: '2025-03-01',
        accountId: '1',
        createdAt: new Date(),
      }

      mockPrisma.fD.create.mockResolvedValue(newFD)

      const request = new NextRequest('http://localhost:3000/api/fds', {
        method: 'POST',
        body: JSON.stringify({
          amount: 75000,
          rate: 6.5,
          startDate: '2024-03-01',
          endDate: '2025-03-01',
          accountId: '1',
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(201)
      expect(data).toEqual(newFD)
      expect(mockPrisma.fD.create).toHaveBeenCalledWith({
        data: {
          amount: 75000,
          rate: 6.5,
          startDate: '2024-03-01',
          endDate: '2025-03-01',
          accountId: '1',
        },
      })
    })

    it('should validate required fields', async () => {
      const request = new NextRequest('http://localhost:3000/api/fds', {
        method: 'POST',
        body: JSON.stringify({
          amount: 75000,
          rate: 6.5,
          // Missing startDate, endDate, accountId
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data).toEqual({ error: 'Amount, rate, start date, end date, and account ID are required' })
      expect(mockPrisma.fD.create).not.toHaveBeenCalled()
    })

    it('should validate numeric fields', async () => {
      const request = new NextRequest('http://localhost:3000/api/fds', {
        method: 'POST',
        body: JSON.stringify({
          amount: 'invalid',
          rate: 'invalid',
          startDate: '2024-03-01',
          endDate: '2025-03-01',
          accountId: '1',
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data).toEqual({ error: 'Amount and rate must be valid numbers' })
      expect(mockPrisma.fD.create).not.toHaveBeenCalled()
    })

    it('should validate date order', async () => {
      const request = new NextRequest('http://localhost:3000/api/fds', {
        method: 'POST',
        body: JSON.stringify({
          amount: 75000,
          rate: 6.5,
          startDate: '2025-03-01', // End date before start date
          endDate: '2024-03-01',
          accountId: '1',
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data).toEqual({ error: 'End date must be after start date' })
      expect(mockPrisma.fD.create).not.toHaveBeenCalled()
    })

    it('should handle database errors during creation', async () => {
      mockPrisma.fD.create.mockRejectedValue(new Error('Database error'))

      const request = new NextRequest('http://localhost:3000/api/fds', {
        method: 'POST',
        body: JSON.stringify({
          amount: 75000,
          rate: 6.5,
          startDate: '2024-03-01',
          endDate: '2025-03-01',
          accountId: '1',
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data).toEqual({ error: 'Failed to create FD' })
    })

    it('should handle invalid JSON', async () => {
      const request = new NextRequest('http://localhost:3000/api/fds', {
        method: 'POST',
        body: 'invalid json',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data).toEqual({ error: 'Invalid JSON' })
      expect(mockPrisma.fD.create).not.toHaveBeenCalled()
    })
  })
})
