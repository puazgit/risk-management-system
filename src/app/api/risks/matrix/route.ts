import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// GET /api/risks/matrix - Get risk matrix data for heatmap visualization
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get("type") || "residual" // inherent or residual
    const unitId = searchParams.get("unitId")

    // Build where clause
    const where: any = {}
    if (unitId) {
      where.ownerUnitId = parseInt(unitId)
    }

    // Get risks with assessment data
    const risks = await prisma.risiko.findMany({
      where,
      include: {
        kategori: true,
        ownerUnit: true,
        risikoInheren: true,
        risikoResidual: true
      }
    })

    // Transform data for matrix visualization
    const matrixData = risks
      .map(risk => {
        const assessment = type === "inherent" ? risk.risikoInheren : risk.risikoResidual
        
        if (!assessment) return null

        return {
          id: risk.id,
          riskNumber: risk.riskNumber,
          namaRisiko: risk.namaRisiko,
          kategori: risk.kategori.categoryBUMN,
          unit: risk.ownerUnit.name,
          probability: type === "inherent" 
            ? (assessment as any).inherenProbScale 
            : (assessment as any).residualProbScale,
          impact: type === "inherent" 
            ? (assessment as any).inherenDampakScale 
            : (assessment as any).residualDampakScale,
          exposure: type === "inherent" 
            ? (assessment as any).inherenExposure 
            : (assessment as any).residualExposure,
          level: type === "inherent" 
            ? (assessment as any).inherenLevel 
            : (assessment as any).residualLevel
        }
      })
      .filter((risk): risk is NonNullable<typeof risk> => risk !== null)

    // Generate matrix grid (5x5)
    const matrixGrid = []
    for (let impact = 5; impact >= 1; impact--) {
      const row = []
      for (let probability = 1; probability <= 5; probability++) {
        const risksInCell = matrixData.filter(
          risk => risk.probability === probability && risk.impact === impact
        )
        
        row.push({
          impact,
          probability,
          exposure: impact * probability,
          level: calculateRiskLevel(impact * probability),
          risks: risksInCell,
          count: risksInCell.length
        })
      }
      matrixGrid.push(row)
    }

    // Risk level statistics
    const levelStats = {
      VERY_HIGH: matrixData.filter(r => r.level === "VERY_HIGH").length,
      HIGH: matrixData.filter(r => r.level === "HIGH").length,
      MODERATE: matrixData.filter(r => r.level === "MODERATE").length,
      LOW: matrixData.filter(r => r.level === "LOW").length,
      VERY_LOW: matrixData.filter(r => r.level === "VERY_LOW").length
    }

    return NextResponse.json({
      type,
      matrixGrid,
      levelStats,
      totalRisks: matrixData.length,
      risks: matrixData
    })

  } catch (error) {
    console.error("Error fetching matrix data:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// Helper function to calculate risk level based on exposure
function calculateRiskLevel(exposure: number): string {
  if (exposure >= 20) return "VERY_HIGH"
  if (exposure >= 15) return "HIGH"
  if (exposure >= 10) return "MODERATE"
  if (exposure >= 5) return "LOW"
  return "VERY_LOW"
}

// POST /api/risks/matrix/export - Export matrix data
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { type = "residual", format = "json" } = body

    // Get matrix data (reuse logic from GET)
    const matrixResponse = await GET(request)
    const matrixData = await matrixResponse.json()

    if (format === "csv") {
      // Generate CSV format
      let csv = "Risk Number,Risk Name,Category,Unit,Probability,Impact,Exposure,Level\n"
      
      matrixData.risks.forEach((risk: any) => {
        csv += `"${risk.riskNumber}","${risk.namaRisiko}","${risk.kategori}","${risk.unit}",${risk.probability},${risk.impact},${risk.exposure},"${risk.level}"\n`
      })

      return new NextResponse(csv, {
        headers: {
          "Content-Type": "text/csv",
          "Content-Disposition": `attachment; filename="risk-matrix-${type}-${new Date().toISOString().split('T')[0]}.csv"`
        }
      })
    }

    return NextResponse.json(matrixData)

  } catch (error) {
    console.error("Error exporting matrix:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}