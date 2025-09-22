import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const unitKerjaSchema = z.object({
  code: z.string().min(1, "Kode unit kerja harus diisi"),
  name: z.string().min(1, "Nama unit kerja harus diisi"),
  hierarchyLevel: z.string().optional()
})

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      )
    }

    const unitKerja = await prisma.unitKerja.findMany({
      orderBy: { name: "asc" },
      include: {
        _count: {
          select: {
            users: true,
            Risiko: true,
            SasaranStrategis: true
          }
        }
      }
    })

    return NextResponse.json({
      data: unitKerja,
      total: unitKerja.length
    })
  } catch (error) {
    console.error("Error fetching unit kerja:", error)
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !["ADMIN", "RISK_OWNER"].includes(session.user?.role || "")) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      )
    }

    const body = await request.json()
    const validatedData = unitKerjaSchema.parse(body)

    // Check if code already exists
    const existingUnit = await prisma.unitKerja.findUnique({
      where: { code: validatedData.code }
    })

    if (existingUnit) {
      return NextResponse.json(
        { message: "Kode unit kerja sudah digunakan" },
        { status: 400 }
      )
    }

    const unitKerja = await prisma.unitKerja.create({
      data: validatedData,
      include: {
        _count: {
          select: {
            users: true,
            Risiko: true,
            SasaranStrategis: true
          }
        }
      }
    })

    return NextResponse.json(unitKerja, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: "Validation error", errors: error.issues },
        { status: 400 }
      )
    }

    console.error("Error creating unit kerja:", error)
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    )
  }
}