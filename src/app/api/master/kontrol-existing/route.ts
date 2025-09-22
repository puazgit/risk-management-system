import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

// Validation schema
const KontrolExistingCreateSchema = z.object({
  riskId: z.number().int().positive("Risk ID harus valid"),
  controlType: z.string().min(1, "Jenis kontrol harus diisi"),
  deskripsiDampak: z.string().optional(),
  effectivenessRating: z.enum(["SANGAT_EFEKTIF", "EFEKTIF", "CUKUP_EFEKTIF", "KURANG_EFEKTIF", "TIDAK_EFEKTIF"]),
})

// GET - Fetch all Kontrol Existing
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const riskId = searchParams.get("riskId")
    const effectivenessRating = searchParams.get("effectivenessRating")

    const kontrols = await prisma.kontrolExisting.findMany({
      where: {
        ...(riskId && { riskId: parseInt(riskId) }),
        ...(effectivenessRating && { effectivenessRating }),
      },
      include: {
        risiko: {
          select: {
            id: true,
            namaRisiko: true,
            riskNumber: true,
          },
        },
      },
      orderBy: [
        { id: "asc" },
      ],
    })

    return NextResponse.json({
      success: true,
      data: kontrols,
    })
  } catch (error) {
    console.error("Error fetching kontrol existing:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// POST - Create new Kontrol Existing
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = KontrolExistingCreateSchema.parse(body)

    // Verify risk exists
    const risk = await prisma.risiko.findUnique({
      where: { id: validatedData.riskId },
    })

    if (!risk) {
      return NextResponse.json(
        { error: "Risiko tidak ditemukan" },
        { status: 400 }
      )
    }

    const kontrol = await prisma.kontrolExisting.create({
      data: {
        ...validatedData,
      },
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
      message: "Kontrol existing berhasil dibuat",
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.issues },
        { status: 400 }
      )
    }

    console.error("Error creating kontrol existing:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}