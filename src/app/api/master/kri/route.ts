import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

// Validation schema
const KRICreateSchema = z.object({
  riskId: z.number().int().positive("Risk ID harus valid"),
  indicatorName: z.string().min(1, "Nama indikator harus diisi"),
  unitSatuan: z.string().min(1, "Unit satuan harus diisi"),
  thresholdCategory: z.string().optional(),
  thresholdValue: z.number().optional(),
})

// GET - Fetch all KRIs
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const riskId = searchParams.get("riskId")

    const kris = await prisma.kRI.findMany({
      where: {
        ...(riskId && { riskId: parseInt(riskId) }),
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
      data: kris,
    })
  } catch (error) {
    console.error("Error fetching KRIs:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// POST - Create new KRI
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = KRICreateSchema.parse(body)

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

    const kri = await prisma.kRI.create({
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
      data: kri,
      message: "KRI berhasil dibuat",
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.issues },
        { status: 400 }
      )
    }

    console.error("Error creating KRI:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}