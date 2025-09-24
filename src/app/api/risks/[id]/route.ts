import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

// GET /api/risks/[id] - Get single risk by ID
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

    const risk = await prisma.risiko.findUnique({
      where: { id: riskId },
      include: {
        kategori: true,
        ownerUnit: true,
        sasaran: {
          include: {
            unit: true
          }
        },
        risikoInheren: true,
        risikoResidual: true,
        kontrolExisting: true,
        perlakuanRisiko: {
          include: {
            pic: {
              include: {
                unit: true
              }
            },
            realisasi: true
          }
        },
        KRI: true,
        realisasiRisiko: {
          orderBy: { periode: "desc" },
          take: 12 // Last 12 periods
        }
      }
    })

    if (!risk) {
      return NextResponse.json({ error: "Risk not found" }, { status: 404 })
    }

    return NextResponse.json(risk)

  } catch (error) {
    console.error("Error fetching risk:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// PUT /api/risks/[id] - Update risk
const updateRiskSchema = z.object({
  sasaranId: z.number().optional(),
  ownerUnitId: z.number().optional(),
  kategoriId: z.number().optional(),
  namaRisiko: z.string().min(1).optional(),
  deskripsi: z.string().optional(),
  riskNumber: z.string().optional()
})

export async function PUT(
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
    const existingRisk = await prisma.risiko.findUnique({
      where: { id: riskId }
    })

    if (!existingRisk) {
      return NextResponse.json({ error: "Risk not found" }, { status: 404 })
    }

    const body = await request.json()
    const validatedData = updateRiskSchema.parse(body)

    // Update risk
    const updatedRisk = await prisma.risiko.update({
      where: { id: riskId },
      data: validatedData,
      include: {
        kategori: true,
        ownerUnit: true,
        sasaran: true,
        risikoInheren: true,
        risikoResidual: true
      }
    })

    return NextResponse.json(updatedRisk)

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.issues },
        { status: 400 }
      )
    }

    console.error("Error updating risk:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// DELETE /api/risks/[id] - Delete risk
export async function DELETE(
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

    // Check if user is admin (only admin can delete risks)
    if (session.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    if (isNaN(riskId)) {
      return NextResponse.json({ error: "Invalid risk ID" }, { status: 400 })
    }

    // Check if risk exists
    const existingRisk = await prisma.risiko.findUnique({
      where: { id: riskId }
    })

    if (!existingRisk) {
      return NextResponse.json({ error: "Risk not found" }, { status: 404 })
    }

    // Delete risk (cascade will handle related records)
    await prisma.risiko.delete({
      where: { id: riskId }
    })

    return NextResponse.json({ message: "Risk deleted successfully" })

  } catch (error) {
    console.error("Error deleting risk:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}