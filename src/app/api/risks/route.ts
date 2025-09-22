import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

// GET /api/risks - List risks with pagination and filtering
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "10")
    const search = searchParams.get("search") || ""
    const category = searchParams.get("category")
    const unitId = searchParams.get("unitId")
    const level = searchParams.get("level")

    const skip = (page - 1) * limit

    // Build where clause
    const where: any = {}
    
    if (search) {
      where.OR = [
        { namaRisiko: { contains: search, mode: "insensitive" } },
        { deskripsi: { contains: search, mode: "insensitive" } },
        { riskNumber: { contains: search, mode: "insensitive" } }
      ]
    }

    if (category) {
      where.kategoriId = parseInt(category)
    }

    if (unitId) {
      where.ownerUnitId = parseInt(unitId)
    }

    if (level) {
      where.OR = [
        { risikoInheren: { inherenLevel: level } },
        { risikoResidual: { residualLevel: level } }
      ]
    }

    // Get risks with related data
    const [risks, total] = await Promise.all([
      prisma.risiko.findMany({
        where,
        include: {
          kategori: true,
          ownerUnit: true,
          sasaran: true,
          risikoInheren: true,
          risikoResidual: true,
          kontrolExisting: true,
          perlakuanRisiko: {
            include: {
              pic: true
            }
          },
          KRI: true
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit
      }),
      prisma.risiko.count({ where })
    ])

    return NextResponse.json({
      data: risks,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    })

  } catch (error) {
    console.error("Error fetching risks:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// POST /api/risks - Create new risk
const createRiskSchema = z.object({
  sasaranId: z.number(),
  ownerUnitId: z.number(),
  kategoriId: z.number(),
  namaRisiko: z.string().min(1),
  deskripsi: z.string().optional(),
  riskNumber: z.string().optional()
})

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = createRiskSchema.parse(body)

    // Generate risk number if not provided
    const riskNumber = validatedData.riskNumber || `RISK-${String(await prisma.risiko.count() + 1).padStart(4, "0")}`

    // Create risk
    const risk = await prisma.risiko.create({
      data: {
        ...validatedData,
        riskNumber
      },
      include: {
        kategori: true,
        ownerUnit: true,
        sasaran: true
      }
    })

    return NextResponse.json(risk, { status: 201 })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.issues },
        { status: 400 }
      )
    }

    console.error("Error creating risk:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}