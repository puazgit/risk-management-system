import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

// Validation schema
const RiskTreatmentUpdateSchema = z.object({
  riskId: z.number().int().positive("Risk ID harus valid").optional(),
  picId: z.number().int().positive("PIC harus dipilih").optional(),
  treatmentOption: z.enum(["MITIGATE", "ACCEPT", "AVOID", "TRANSFER"]).optional(),
  treatmentPlan: z.string().min(1, "Rencana perlakuan harus diisi").optional(),
  output: z.string().min(1, "Output harus diisi").optional(),
  costRupiah: z.number().min(0).optional(),
  timelineMonths: z.number().int().min(1).optional(),
  rkapProgramType: z.string().optional(),
})

// GET - Fetch single Risk Treatment Plan
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idParam } = await context.params
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const id = parseInt(idParam)
    if (isNaN(id)) {
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 })
    }

    const treatment = await prisma.perlakuanRisiko.findUnique({
      where: { id },
      include: {
        risiko: {
          select: {
            id: true,
            namaRisiko: true,
            riskNumber: true,
          },
        },
        pic: {
          select: {
            id: true,
            name: true,
            email: true,
            unit: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        realisasi: {
          select: {
            id: true,
            status: true,
            progress: true,
            periode: true,
            realisasiBiaya: true,
            persentaseSerapan: true,
          },
          orderBy: {
            periode: "desc",
          },
        },
      },
    })

    if (!treatment) {
      return NextResponse.json({ error: "Risk treatment plan tidak ditemukan" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      data: treatment,
    })
  } catch (error) {
    console.error("Error fetching risk treatment:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// PUT - Update Risk Treatment Plan
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idParam } = await context.params
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const id = parseInt(idParam)
    if (isNaN(id)) {
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 })
    }

    const body = await request.json()
    const validatedData = RiskTreatmentUpdateSchema.parse(body)

    // Check if treatment exists
    const existingTreatment = await prisma.perlakuanRisiko.findUnique({
      where: { id },
    })

    if (!existingTreatment) {
      return NextResponse.json({ error: "Risk treatment plan tidak ditemukan" }, { status: 404 })
    }

    // Verify risk exists if riskId is provided
    if (validatedData.riskId) {
      const risk = await prisma.risiko.findUnique({
        where: { id: validatedData.riskId },
      })

      if (!risk) {
        return NextResponse.json(
          { error: "Risiko tidak ditemukan" },
          { status: 400 }
        )
      }
    }

    // Verify PIC exists if picId is provided
    if (validatedData.picId) {
      const pic = await prisma.user.findUnique({
        where: { id: validatedData.picId },
      })

      if (!pic) {
        return NextResponse.json(
          { error: "PIC tidak ditemukan" },
          { status: 400 }
        )
      }
    }

    const treatment = await prisma.perlakuanRisiko.update({
      where: { id },
      data: validatedData,
      include: {
        risiko: {
          select: {
            id: true,
            namaRisiko: true,
            riskNumber: true,
          },
        },
        pic: {
          select: {
            id: true,
            name: true,
            email: true,
            unit: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    })

    return NextResponse.json({
      success: true,
      data: treatment,
      message: "Risk treatment plan berhasil diperbarui",
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.issues },
        { status: 400 }
      )
    }

    console.error("Error updating risk treatment:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// DELETE - Delete Risk Treatment Plan
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idParam } = await context.params
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const id = parseInt(idParam)
    if (isNaN(id)) {
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 })
    }

    // Check if treatment exists
    const existingTreatment = await prisma.perlakuanRisiko.findUnique({
      where: { id },
    })

    if (!existingTreatment) {
      return NextResponse.json({ error: "Risk treatment plan tidak ditemukan" }, { status: 404 })
    }

    await prisma.perlakuanRisiko.delete({
      where: { id },
    })

    return NextResponse.json({
      success: true,
      message: "Risk treatment plan berhasil dihapus",
    })
  } catch (error) {
    console.error("Error deleting risk treatment:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}