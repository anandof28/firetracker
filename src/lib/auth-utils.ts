import { auth, clerkClient } from '@clerk/nextjs/server'
import { prisma } from './prisma'

/**
 * Get the authenticated user ID from Clerk and ensure user exists in database
 */
export async function getAuthenticatedUser() {
  const { userId } = await auth()
  
  if (!userId) {
    throw new Error('Unauthorized')
  }

  try {
    // Check if user exists first to avoid unnecessary upserts
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true }
    })

    // Only upsert if user doesn't exist
    if (!existingUser) {
      const client = await clerkClient()
      const clerkUser = await client.users.getUser(userId)
      const email = clerkUser.emailAddresses[0]?.emailAddress || `${userId}@clerk-user.com`

      await prisma.user.create({
        data: {
          id: userId,
          email: email,
          name: clerkUser.firstName && clerkUser.lastName 
            ? `${clerkUser.firstName} ${clerkUser.lastName}` 
            : clerkUser.username || clerkUser.firstName || null,
        },
      })
    }
  } catch (error) {
    // Log but don't fail - user authentication is more important than database sync
    console.error('Error syncing user to database:', error)
  }

  return { userId }
}

/**
 * Verify that a resource belongs to the authenticated user
 */
export async function verifyResourceAccess(userId: string, resourceType: string, resourceId: string) {
  let resource = null
  
  switch (resourceType) {
    case 'account':
      resource = await prisma.account.findFirst({
        where: { id: resourceId, userId }
      })
      break
    case 'transaction':
      resource = await prisma.transaction.findFirst({
        where: { id: resourceId, userId }
      })
      break
    case 'fd':
      resource = await prisma.fD.findFirst({
        where: { id: resourceId, userId }
      })
      break
    case 'gold':
      resource = await prisma.gold.findFirst({
        where: { id: resourceId, userId }
      })
      break
    case 'goal':
      resource = await prisma.goal.findFirst({
        where: { id: resourceId, userId }
      })
      break
    default:
      throw new Error(`Unknown resource type: ${resourceType}`)
  }
  
  if (!resource) {
    throw new Error('Resource not found or access denied')
  }
  
  return resource
}
