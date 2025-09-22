import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { startOfMonth, endOfMonth, subMonths, format } from "date-fns"

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const unitId = searchParams.get("unitId")
    const months = parseInt(searchParams.get("months") || "6")

    // Get current period and historical periods
    const currentDate = new Date()
    const periods = Array.from({ length: months }, (_, i) => {
      const date = subMonths(currentDate, i)
      return {
        start: startOfMonth(date),
        end: endOfMonth(date),
        label: format(date, 'MMM yyyy')
      }
    }).reverse()

    // Build where clause for risk filtering
    const riskWhere: any = {}
    if (unitId) {
      riskWhere.ownerUnitId = parseInt(unitId)
    }

    // Get risk trend data
    const riskTrendData = await Promise.all(
      periods.map(async (period) => {
        const [
          totalRisks,
          highRisks,
          treatmentPlans,
          overdueTreatments,
          kriAlerts
        ] = await Promise.all([
          // Total risks
          prisma.risiko.count({
            where: {
              ...riskWhere,
              createdAt: {
                lte: period.end
              }
            }
          }),
          
          // High/Critical risks
          prisma.risikoResidual.count({
            where: {
              risiko: riskWhere,
              residualLevel: {
                in: ["HIGH", "VERY_HIGH"]
              }
            }
          }),
          
          // Treatment plans
          prisma.perlakuanRisiko.count({
            where: {
              risiko: riskWhere
            }
          }),
          
          // Overdue treatments (assuming 3 months as overdue)
          prisma.perlakuanRisiko.count({
            where: {
              risiko: riskWhere,
              realisasi: {
                none: {}
              }
            }
          }),
          
          // KRI alerts (assuming threshold breaches)
          prisma.kRI.count({
            where: {
              risiko: riskWhere,
              thresholdValue: {
                not: null
              }
            }
          })
        ])

        return {
          period: period.label,
          totalRisks,
          highRisks,
          treatmentPlans,
          overdueTreatments,
          kriAlerts,
          complianceScore: totalRisks > 0 ? Math.round(((totalRisks - highRisks) / totalRisks) * 100) : 100
        }
      })
    )

    // Get risk level distribution for heat map
    const riskLevelDistribution = await prisma.risikoResidual.groupBy({
      by: ['residualLevel'],
      where: {
        risiko: riskWhere
      },
      _count: {
        residualLevel: true
      }
    })

    // Get risk by category distribution
    const riskByCategoryRaw = await prisma.risiko.groupBy({
      by: ['kategoriId'],
      where: riskWhere,
      _count: {
        kategoriId: true
      }
    })

    // Get category names separately
    const categoryIds = riskByCategoryRaw.map(item => item.kategoriId)
    const categories = await prisma.taksonomiRisiko.findMany({
      where: {
        id: {
          in: categoryIds
        }
      },
      select: {
        id: true,
        categoryBUMN: true
      }
    })

    const riskByCategory = riskByCategoryRaw.map(item => {
      const category = categories.find(cat => cat.id === item.kategoriId)
      return {
        categoryId: item.kategoriId,
        categoryName: category?.categoryBUMN || 'Unknown',
        count: item._count.kategoriId
      }
    })

    // Get recent risk events (loss events)
    const recentLossEvents = await prisma.kejadianKerugian.findMany({
      take: 5,
      orderBy: {
        tanggalKejadian: 'desc'
      },
      where: {
        tanggalKejadian: {
          gte: subMonths(currentDate, 3)
        }
      }
    })

    // Calculate KRI performance
    const kriPerformance = await prisma.kRI.findMany({
      where: {
        risiko: riskWhere,
        thresholdValue: {
          not: null
        }
      },
      include: {
        risiko: {
          select: {
            namaRisiko: true,
            ownerUnit: {
              select: {
                name: true
              }
            }
          }
        }
      }
    })

    // Get treatment effectiveness data
    const treatmentEffectiveness = await prisma.perlakuanRisiko.findMany({
      where: {
        risiko: riskWhere
      },
      include: {
        realisasi: {
          orderBy: {
            periode: 'desc'
          },
          take: 1
        },
        risiko: {
          select: {
            namaRisiko: true
          }
        }
      }
    })

    const response = {
      trendData: riskTrendData,
      riskLevelDistribution: riskLevelDistribution.map(item => ({
        level: item.residualLevel,
        count: item._count.residualLevel
      })),
      riskByCategory: riskByCategory,
      recentLossEvents: recentLossEvents.map(event => ({
        id: event.id,
        name: event.namaKejadian,
        date: event.tanggalKejadian,
        loss: event.nilaiKerugian,
        category: event.kategoriRisikoBUMN
      })),
      kriPerformance: kriPerformance.map(kri => ({
        id: kri.id,
        name: kri.indicatorName,
        threshold: kri.thresholdValue,
        unit: kri.unitSatuan,
        riskName: kri.risiko.namaRisiko,
        ownerUnit: kri.risiko.ownerUnit.name
      })),
      treatmentEffectiveness: treatmentEffectiveness.map(treatment => ({
        id: treatment.id,
        riskName: treatment.risiko.namaRisiko,
        plan: treatment.treatmentPlan,
        cost: treatment.costRupiah,
        timeline: treatment.timelineMonths,
        progress: treatment.realisasi.length > 0 ? treatment.realisasi[0].progress : "Not Started"
      }))
    }

    return NextResponse.json(response)
    
  } catch (error) {
    console.error("Analytics API error:", error)
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    )
  }
}