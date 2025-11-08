import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

const createPrismaClient = () => {
  return new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
    errorFormat: 'minimal',
  })
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient()

// Prevent multiple instances during development
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}

// Graceful shutdown - disconnect on exit
if (typeof process !== 'undefined') {
  const cleanup = async () => {
    try {
      await prisma.$disconnect()
    } catch (error) {
      console.error('Error disconnecting Prisma:', error)
    }
  }
  
  process.on('beforeExit', cleanup)
  process.on('SIGINT', cleanup)
  process.on('SIGTERM', cleanup)
}
