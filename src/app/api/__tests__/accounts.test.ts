import { NextRequest } from 'next/server'
import { GET, POST } from '../accounts/route'

// Mock Prisma
const mockPrisma = {
  account: {
    findMany: jest.fn(),
    create: jest.fn(),
  },
}

jest.mock('@/lib/prisma', () => ({
  __esModule: true,
  default: mockPrisma,
}))

describe('/api/accounts', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('GET /api/accounts', () => {
    it('should return all accounts', async () => {
      const mockAccounts = [
        { id: '1', name: 'SBI Savings', balance: 50000, createdAt: new Date() },
        { id: '2', name: 'HDFC Current', balance: 25000, createdAt: new Date() },
      ]

      mockPrisma.account.findMany.mockResolvedValue(mockAccounts)

      const response = await GET()
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toEqual(mockAccounts)
      expect(mockPrisma.account.findMany).toHaveBeenCalledWith({
        orderBy: { createdAt: 'desc' },
      })
    })

    it('should handle database errors', async () => {
      mockPrisma.account.findMany.mockRejectedValue(new Error('Database error'))

      const response = await GET()
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data).toEqual({ error: 'Failed to fetch accounts' })
    })
  })

  describe('POST /api/accounts', () => {
    it('should create a new account', async () => {
      const newAccount = {
        id: '3',
        name: 'ICICI Savings',
        balance: 30000,
        createdAt: new Date(),
      }

      mockPrisma.account.create.mockResolvedValue(newAccount)

      const request = new NextRequest('http://localhost:3000/api/accounts', {
        method: 'POST',
        body: JSON.stringify({
          name: 'ICICI Savings',
          balance: 30000,
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(201)
      expect(data).toEqual(newAccount)
      expect(mockPrisma.account.create).toHaveBeenCalledWith({
        data: {
          name: 'ICICI Savings',
          balance: 30000,
        },
      })
    })

    it('should validate required fields', async () => {
      const request = new NextRequest('http://localhost:3000/api/accounts', {
        method: 'POST',
        body: JSON.stringify({
          name: 'Test Account',
          // Missing balance
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data).toEqual({ error: 'Name and balance are required' })
      expect(mockPrisma.account.create).not.toHaveBeenCalled()
    })

    it('should validate balance is a number', async () => {
      const request = new NextRequest('http://localhost:3000/api/accounts', {
        method: 'POST',
        body: JSON.stringify({
          name: 'Test Account',
          balance: 'invalid',
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data).toEqual({ error: 'Balance must be a valid number' })
      expect(mockPrisma.account.create).not.toHaveBeenCalled()
    })

    it('should handle database errors during creation', async () => {
      mockPrisma.account.create.mockRejectedValue(new Error('Database error'))

      const request = new NextRequest('http://localhost:3000/api/accounts', {
        method: 'POST',
        body: JSON.stringify({
          name: 'Test Account',
          balance: 1000,
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data).toEqual({ error: 'Failed to create account' })
    })

    it('should handle invalid JSON', async () => {
      const request = new NextRequest('http://localhost:3000/api/accounts', {
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
      expect(mockPrisma.account.create).not.toHaveBeenCalled()
    })
  })
})
