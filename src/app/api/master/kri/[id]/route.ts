import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

// Validation schema
const KRIUpdateSchema = z.object({
  riskId: z.number().int().positive("Risk ID harus valid").optional(),
  indicatorName: z.string().min(1, "Nama indikator harus diisi").optional(),
  unitSatuan: z.string().min(1, "Unit satuan harus diisi").optional(),
  thresholdCategory: z.string().optional(),
  thresholdValue: z.number().optional(),
})

// GET - Fetch single KRI
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

    const kri = await prisma.kRI.findUnique({
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

    if (!kri) {
      return NextResponse.json({ error: "KRI tidak ditemukan" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      data: kri,
    })
  } catch (error) {
    console.error("Error fetching KRI:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// PUT - Update KRI
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
    const validatedData = KRIUpdateSchema.parse(body)

    // Check if KRI exists
    const existingKRI = await prisma.kRI.findUnique({
      where: { id },
    })

    if (!existingKRI) {
      return NextResponse.json({ error: "KRI tidak ditemukan" }, { status: 404 })
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

    const kri = await prisma.kRI.update({
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
      data: kri,
      message: "KRI berhasil diperbarui",
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.issues },
        { status: 400 }
      )
    }

    console.error("Error updating KRI:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// DELETE - Delete KRI
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

    // Check if KRI exists
    const existingKRI = await prisma.kRI.findUnique({
      where: { id },
    })

    if (!existingKRI) {
      return NextResponse.json({ error: "KRI tidak ditemukan" }, { status: 404 })
    }

    await prisma.kRI.delete({
      where: { id },
    })

    return NextResponse.json({
      success: true,
      message: "KRI berhasil dihapus",
    })
  } catch (error) {
    console.error("Error deleting KRI:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}