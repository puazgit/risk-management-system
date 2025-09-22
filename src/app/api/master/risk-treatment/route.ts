import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

// Validation schema
const RiskTreatmentCreateSchema = z.object({
  riskId: z.number().int().positive("Risk ID harus valid"),
  picId: z.number().int().positive("PIC harus dipilih"),
  treatmentOption: z.enum(["MITIGATE", "ACCEPT", "AVOID", "TRANSFER"]).optional(),
  treatmentPlan: z.string().min(1, "Rencana perlakuan harus diisi"),
  output: z.string().min(1, "Output harus diisi"),
  costRupiah: z.number().min(0).optional(),
  timelineMonths: z.number().int().min(1).optional(),
  rkapProgramType: z.string().optional(),
})

// GET - Fetch all Risk Treatment Plans
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const riskId = searchParams.get("riskId")
    const picId = searchParams.get("picId")
    const treatmentOption = searchParams.get("treatmentOption")

    const treatments = await prisma.perlakuanRisiko.findMany({
      where: {
        ...(riskId && { riskId: parseInt(riskId) }),
        ...(picId && { picId: parseInt(picId) }),
        ...(treatmentOption && { treatmentOption }),
      },
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
          },
        },
        realisasi: {
          select: {
            id: true,
            status: true,
            progress: true,
            periode: true,
          },
          orderBy: {
            periode: "desc",
          },
          take: 1,
        },
        _count: {
          select: {
            realisasi: true,
          },
        },
      },
      orderBy: [
        { id: "asc" },
      ],
    })

    return NextResponse.json({
      success: true,
      data: treatments,
    })
  } catch (error) {
    console.error("Error fetching risk treatments:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// POST - Create new Risk Treatment Plan
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = RiskTreatmentCreateSchema.parse(body)

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

    // Verify PIC (user) exists
    const pic = await prisma.user.findUnique({
      where: { id: validatedData.picId },
    })

    if (!pic) {
      return NextResponse.json(
        { error: "PIC (Person In Charge) tidak ditemukan" },
        { status: 400 }
      )
    }

    const treatment = await prisma.perlakuanRisiko.create({
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
        pic: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    })

    return NextResponse.json({
      success: true,
      data: treatment,
      message: "Risk treatment plan berhasil dibuat",
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.issues },
        { status: 400 }
      )
    }

    console.error("Error creating risk treatment:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}