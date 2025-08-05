'use client'

import { SignedIn, SignedOut } from '@clerk/nextjs'
import DashboardContent from './dashboard-content'
import LandingPage from './landing/page'

export default function HomePage() {
  return (
    <>
      <SignedOut>
        <LandingPage />
      </SignedOut>
      <SignedIn>
        <DashboardContent />
      </SignedIn>
    </>
  )
}
