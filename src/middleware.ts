import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
  function middleware(req) {
    // Check if user is trying to access admin routes
    if (req.nextUrl.pathname.startsWith("/admin")) {
      const token = req.nextauth.token
      
      // Check if user has admin role
      if (!token || token.role !== "ADMIN") {
        // Redirect to dashboard if not admin
        return NextResponse.redirect(new URL("/dashboard", req.url))
      }
    }
    
    return NextResponse.next()
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
    "/master/:path*"
  ]
}