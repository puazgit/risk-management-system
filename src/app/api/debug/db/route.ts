import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  // Only allow in development or with secret key
  const secret = request.nextUrl.searchParams.get('secret')
  if (process.env.NODE_ENV === 'production' && secret !== 'debug123') {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    // Test database connection
    const result = await prisma.$queryRaw`SELECT 1 as test`
    
    // Count some records
    const userCount = await prisma.user.count()
    const riskCount = await prisma.risiko.count()
    
    return NextResponse.json({
      success: true,
      database_connected: true,
      test_query: result,
      counts: {
        users: userCount,
        risks: riskCount
      },
      message: "Database connection successful"
    })
  } catch (error) {
    console.error("Database connection error:", error)
    return NextResponse.json({
      success: false,
      database_connected: false,
      error: error instanceof Error ? error.message : "Unknown error",
      message: "Database connection failed"
    }, { status: 500 })
  }
}