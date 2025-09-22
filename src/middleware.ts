import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
  function middleware(req) {
    const response = NextResponse.next()
    
    // Add security headers
    response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains')
    response.headers.set('X-Frame-Options', 'DENY')
    response.headers.set('X-Content-Type-Options', 'nosniff')
    response.headers.set('X-XSS-Protection', '1; mode=block')
    
    // Add cache control for static assets
    if (req.nextUrl.pathname.startsWith('/_next/static')) {
      response.headers.set('Cache-Control', 'public, max-age=31536000, immutable')
    }
    
    // Add cache control for API routes
    if (req.nextUrl.pathname.startsWith('/api')) {
      response.headers.set('Cache-Control', 'public, max-age=300, s-maxage=600')
    }
    
    // Check if user is trying to access admin routes
    if (req.nextUrl.pathname.startsWith("/admin")) {
      const token = req.nextauth.token
      
      // Check if user has admin role
      if (!token || token.role !== "ADMIN") {
        // Redirect to dashboard if not admin
        return NextResponse.redirect(new URL("/dashboard", req.url))
      }
    }
    
    return response
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Allow access to non-protected routes
        if (!req.nextUrl.pathname.startsWith("/admin")) {
          return !!token
        }
        
        // For admin routes, check if user has admin role
        return !!token && token.role === "ADMIN"
      },
    },
  }
)

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/admin/:path*",
    "/risks/:path*",
    "/analytics/:path*",
    "/master/:path*",
    "/((?!api|_next/static|_next/image|favicon.ico).*)"
  ]
}