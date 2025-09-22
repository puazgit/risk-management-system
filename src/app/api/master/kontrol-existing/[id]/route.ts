import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

// Validation schema
const KontrolExistingUpdateSchema = z.object({
  riskId: z.number().int().positive("Risk ID harus valid").optional(),
  controlType: z.string().min(1, "Jenis kontrol harus diisi").optional(),
  deskripsiDampak: z.string().optional(),
  effectivenessRating: z.enum(["SANGAT_EFEKTIF", "EFEKTIF", "CUKUP_EFEKTIF", "KURANG_EFEKTIF", "TIDAK_EFEKTIF"]).optional(),
})

// GET - Fetch single Kontrol Existing
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

    const kontrol = await prisma.kontrolExisting.findUnique({
      where: { id },
      include: {
        risiko: {
          select: {
            id: true,
            namaRisiko: true,
            riskNumber: true,
          },
        },
      },
    })

    if (!kontrol) {
      return NextResponse.json({ error: "Kontrol existing tidak ditemukan" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      data: kontrol,
    })
  } catch (error) {
    console.error("Error fetching kontrol existing:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// PUT - Update Kontrol Existing
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
    const validatedData = KontrolExistingUpdateSchema.parse(body)

    // Check if kontrol exists
    const existingKontrol = await prisma.kontrolExisting.findUnique({
      where: { id },
    })

    if (!existingKontrol) {
      return NextResponse.json({ error: "Kontrol existing tidak ditemukan" }, { status: 404 })
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

    const kontrol = await prisma.kontrolExisting.update({
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
      },
    })

    return NextResponse.json({
      success: true,
      data: kontrol,
      message: "Kontrol existing berhasil diperbarui",
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.issues },
        { status: 400 }
      )
    }

    console.error("Error updating kontrol existing:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// DELETE - Delete Kontrol Existing
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

    // Check if kontrol exists
    const existingKontrol = await prisma.kontrolExisting.findUnique({
      where: { id },
    })

    if (!existingKontrol) {
      return NextResponse.json({ error: "Kontrol existing tidak ditemukan" }, { status: 404 })
    }

    await prisma.kontrolExisting.delete({
      where: { id },
    })

    return NextResponse.json({
      success: true,
      message: "Kontrol existing berhasil dihapus",
    })
  } catch (error) {
    console.error("Error deleting kontrol existing:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}