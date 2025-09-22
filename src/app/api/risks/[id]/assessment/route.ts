import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

// POST /api/risks/[id]/assessment - Create or update risk assessment
const assessmentSchema = z.object({
  type: z.enum(["INHERENT", "RESIDUAL"]),
  dampakValue: z.number(),
  dampakScale: z.number().min(1).max(5),
  probValue: z.number(),
  probScale: z.number().min(1).max(5),
  penjelasanDampakKualitatif: z.string().optional(),
  targetResidual: z.string().optional()
})

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const riskId = parseInt(id)

    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (isNaN(riskId)) {
      return NextResponse.json({ error: "Invalid risk ID" }, { status: 400 })
    }

    // Check if risk exists
    const risk = await prisma.risiko.findUnique({
      where: { id: riskId }
    })

    if (!risk) {
      return NextResponse.json({ error: "Risk not found" }, { status: 404 })
    }

    const body = await request.json()
    const validatedData = assessmentSchema.parse(body)

    // Calculate exposure and level
    const exposure = validatedData.dampakValue * validatedData.probValue
    const level = calculateRiskLevel(exposure)

    if (validatedData.type === "INHERENT") {
      // Create or update inherent risk assessment
      const assessment = await prisma.risikoInheren.upsert({
        where: { riskId },
        create: {
          riskId,
          inherenDampakValue: validatedData.dampakValue,
          inherenDampakScale: validatedData.dampakScale,
          inherenProbValue: validatedData.probValue,
          inherenProbScale: validatedData.probScale,
          inherenExposure: exposure,
          inherenLevel: level,
          penjelasanDampakKualitatif: validatedData.penjelasanDampakKualitatif
        },
        update: {
          inherenDampakValue: validatedData.dampakValue,
          inherenDampakScale: validatedData.dampakScale,
          inherenProbValue: validatedData.probValue,
          inherenProbScale: validatedData.probScale,
          inherenExposure: exposure,
          inherenLevel: level,
          penjelasanDampakKualitatif: validatedData.penjelasanDampakKualitatif
        }
      })

      return NextResponse.json(assessment)

    } else {
      // Create or update residual risk assessment
      const assessment = await prisma.risikoResidual.upsert({
        where: { riskId },
        create: {
          riskId,
          residualDampakValue: validatedData.dampakValue,
          residualDampakScale: validatedData.dampakScale,
          residualProbValue: validatedData.probValue,
          residualProbScale: validatedData.probScale,
          residualExposure: exposure,
          residualLevel: level,
          targetResidual: validatedData.targetResidual
        },
        update: {
          residualDampakValue: validatedData.dampakValue,
          residualDampakScale: validatedData.dampakScale,
          residualProbValue: validatedData.probValue,
          residualProbScale: validatedData.probScale,
          residualExposure: exposure,
          residualLevel: level,
          targetResidual: validatedData.targetResidual
        }
      })

      return NextResponse.json(assessment)
    }

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.issues },
        { status: 400 }
      )
    }

    console.error("Error creating assessment:", error)
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

// GET /api/risks/[id]/assessment - Get risk assessments
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const riskId = parseInt(id)

    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (isNaN(riskId)) {
      return NextResponse.json({ error: "Invalid risk ID" }, { status: 400 })
    }

    // Get both inherent and residual assessments
    const [inherent, residual] = await Promise.all([
      prisma.risikoInheren.findUnique({
        where: { riskId }
      }),
      prisma.risikoResidual.findUnique({
        where: { riskId }
      })
    ])

    return NextResponse.json({
      inherent,
      residual
    })

  } catch (error) {
    console.error("Error fetching assessments:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}