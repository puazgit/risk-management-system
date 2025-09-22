import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  // Only allow in development or with secret key
  const secret = request.nextUrl.searchParams.get('secret')
  if (process.env.NODE_ENV === 'production' && secret !== 'debug123') {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  return NextResponse.json({
    environment: process.env.NODE_ENV,
    database_url_exists: !!process.env.DATABASE_URL,
    database_url_prod_exists: !!process.env.DATABASE_URL_PROD,
    nextauth_secret_exists: !!process.env.NEXTAUTH_SECRET,
    nextauth_url_exists: !!process.env.NEXTAUTH_URL,
    nextauth_url: process.env.NEXTAUTH_URL,
    database_url_preview: process.env.DATABASE_URL?.substring(0, 50) + '...',
    database_url_prod_preview: process.env.DATABASE_URL_PROD?.substring(0, 50) + '...',
  })
}