import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    // Check if user is authenticated and is admin
    if (!session || session.user?.role !== "ADMIN") {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      )
    }

    // Get statistics
    const [
      totalUsers,
      totalAdmins,
      recentUsers,
      usersByRole
    ] = await Promise.all([
      prisma.authUser.count(),
      prisma.authUser.count({
        where: { role: "ADMIN" }
      }),
      prisma.authUser.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          createdAt: true
        }
      }),
      prisma.authUser.groupBy({
        by: ["role"],
        _count: {
          role: true
        }
      })
    ])

    const stats = {
      totalUsers,
      totalAdmins,
      totalRegularUsers: totalUsers - totalAdmins,
      recentUsers,
      usersByRole: usersByRole.map((item: any) => ({
        role: item.role,
        count: item._count.role
      }))
    }

    return NextResponse.json(stats)
    
  } catch (error) {
    console.error("Admin stats error:", error)
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    )
  }
}