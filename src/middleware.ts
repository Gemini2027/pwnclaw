import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

const isPublicRoute = createRouteMatcher([
  '/',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/terms',
  '/privacy',
  '/imprint',
  '/api/webhooks(.*)',
  '/api/test(.*)',  // Public for agent connections
  '/api/v1(.*)',    // W11: Public for API-key-authenticated CI/CD endpoints
  '/api/benchmark', // Public anonymous benchmark
  '/api/badge(.*)',  // Public badge SVG endpoint for README embedding
  '/blog(.*)',
  '/attacks(.*)',
  '/benchmarks(.*)',
  '/sitemap.xml',
  '/robots.txt',
])

export default clerkMiddleware(async (auth, request) => {
  const { userId } = await auth()
  
  // Logged-in users hitting the LP → redirect to dashboard
  if (userId && request.nextUrl.pathname === '/') {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }
  
  if (!isPublicRoute(request)) {
    await auth.protect()
  }
})

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
}
