import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function migrateExistingData() {
  try {
    console.log('🚀 Starting data migration for multi-tenancy...')
    
    // Check current database state
    const stats = {
      users: await prisma.user.count(),
      accounts: await prisma.account.count(),
      transactions: await prisma.transaction.count(),
      fds: await prisma.fD.count(),
      gold: await prisma.gold.count(),
      goals: await prisma.goal.count(),
      fundAdditions: await prisma.fundAddition.count(),
    }
    
    console.log('📊 Current database stats:', stats)
    
    // Create a default user if none exists
    if (stats.users === 0) {
      const defaultUser = await prisma.user.create({
        data: {
          id: 'user_default_migration',
          email: 'default@firetracker.local',
          name: 'Default User (Migration)',
        },
      })
      console.log('✅ Created default user:', defaultUser.email)
    } else {
      console.log('✅ Users already exist in database')
    }
    
    console.log('✅ Multi-tenancy migration completed successfully!')
    console.log('📝 Note: Since the migration recreated tables, your existing data may need to be re-imported')
    console.log('� The database is now ready for multi-tenant usage with Clerk authentication')
    
  } catch (error) {
    console.error('❌ Migration failed:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Run the migration
if (require.main === module) {
  migrateExistingData()
    .then(() => process.exit(0))
    .catch(() => process.exit(1))
}
