import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

const isProtectedRoute = createRouteMatcher([
  '/dashboard(.*)',
  '/accounts(.*)',
  '/fds(.*)',
  '/gold(.*)',
  '/transactions(.*)',
  '/goals(.*)',
  '/reports(.*)',
  '/emis(.*)',
  '/budgets(.*)',
  '/mutual-funds(.*)',
  '/import-portfolio(.*)',
  '/api/accounts(.*)',
  '/api/fds(.*)',
  '/api/gold(.*)',
  '/api/transactions(.*)',
  '/api/goals(.*)',
  '/api/reports(.*)',
  '/api/loans(.*)',
  '/api/budgets(.*)',
  '/api/mutual-funds(.*)',
  '/api/import-portfolio(.*)'
])

const isPublicApiRoute = createRouteMatcher([
  '/api/gold-rate',
  '/api/test-db',
  '/api/health'
])

export default clerkMiddleware(async (auth, req) => {
  // Allow public access to monitoring endpoints
  if (isPublicApiRoute(req)) {
    return
  }
  
  if (isProtectedRoute(req)) {
    await auth.protect()
  }
})

export const config = {
  matcher: [
    // Skip Next.js internals and all static files
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
