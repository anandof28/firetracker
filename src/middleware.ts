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

const isPublicRoute = createRouteMatcher([
  '/',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/api/health',
  '/api/gold-rate',
  '/api/test-db'
])

export default clerkMiddleware((auth, req) => {
  // Allow public routes
  if (isPublicRoute(req)) {
    return
  }
  
  // Protect all other routes
  if (isProtectedRoute(req)) {
    auth.protect()
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
