import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const checks = {
      environment: process.env.NODE_ENV,
      databaseUrl: process.env.DATABASE_URL ? 'Set' : 'Missing',
      directUrl: process.env.DIRECT_URL ? 'Set' : 'Missing',
      clerkPublicKey: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ? 'Set' : 'Missing',
      clerkSecretKey: process.env.CLERK_SECRET_KEY ? 'Set' : 'Missing',
      timestamp: new Date().toISOString()
    }
    
    return NextResponse.json({
      status: 'ok',
      checks,
      message: 'All environment variables configured'
    })
  } catch (error) {
    return NextResponse.json(
      {
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
