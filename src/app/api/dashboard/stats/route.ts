import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    // Check if user is authenticated
    if (!session) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      )
    }

    // Get risk management statistics
    const [
      totalRisks,
      risksByLevel,
      risksByCategory,
      recentRisks,
      pendingAssessments
    ] = await Promise.all([
      // Total risks count
      prisma.risiko.count(),
      
      // Risks by level (from inherent risk)
      prisma.risikoInheren.groupBy({
        by: ["inherenLevel"],
        _count: {
          inherenLevel: true
        }
      }),
      
      // Risks by category/taxonomy
      prisma.risiko.groupBy({
        by: ["kategoriId"],
        _count: {
          kategoriId: true
        }
      }),
      
      // Recent risks (last 5)
      prisma.risiko.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          namaRisiko: true,
          createdAt: true,
          kategori: {
            select: {
              categoryBUMN: true
            }
          }
        }
      }),
      
      // Pending assessments (risks without assessment)
      prisma.risiko.count({
        where: {
          risikoInheren: null
        }
      })
    ])

    // Calculate risk distribution percentages
    const riskLevelDistribution = risksByLevel.map(item => ({
      level: item.inherenLevel,
      count: item._count.inherenLevel,
      percentage: totalRisks > 0 ? Math.round((item._count.inherenLevel / totalRisks) * 100) : 0
    }))

    // Get top risk categories
    const categoryStats = await Promise.all(
      risksByCategory.map(async (item) => {
        const category = await prisma.taksonomiRisiko.findUnique({
          where: { id: item.kategoriId! },
          select: { categoryBUMN: true }
        })
        return {
          categoryId: item.kategoriId,
          categoryName: category?.categoryBUMN || "Unknown",
          count: item._count.kategoriId
        }
      })
    )

    const stats = {
      overview: {
        totalRisks,
        pendingAssessments,
        activeRisks: totalRisks
      },
      riskLevelDistribution,
      categoryStats,
      recentRisks,
      trends: {
        // Could add month-over-month trends here in the future
        newRisksThisMonth: await prisma.risiko.count({
          where: {
            createdAt: {
              gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
            }
          }
        })
      }
    }

    return NextResponse.json(stats)
  } catch (error) {
    console.error("Dashboard stats error:", error)
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    )
  }
}