import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

const isProtectedRoute = createRouteMatcher([
  '/accounts(.*)',
  '/fds(.*)',
  '/gold(.*)',
  '/transactions(.*)',
  '/goals(.*)',
  '/reports(.*)',
  '/import-portfolio(.*)',
  '/api/accounts(.*)',
  '/api/fds(.*)',
  '/api/gold(.*)',
  '/api/transactions(.*)',
  '/api/goals(.*)',
  '/api/reports(.*)',
  '/api/import-portfolio(.*)'
])

const isPublicApiRoute = createRouteMatcher([
  '/api/gold-rate'
])

export default clerkMiddleware(async (auth, req) => {
  // Allow public access to gold-rate API
  if (isPublicApiRoute(req)) {
    return
  }
  
  if (isProtectedRoute(req)) {
    await auth.protect()
  }
})

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};
