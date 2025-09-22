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

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      )
    }

    const { id } = await params
    const unitKerja = await prisma.unitKerja.findUnique({
      where: { id: parseInt(id) },
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

    if (!unitKerja) {
      return NextResponse.json(
        { message: "Unit kerja not found" },
        { status: 404 }
      )
    }

    return NextResponse.json(unitKerja)
  } catch (error) {
    console.error("Error fetching unit kerja:", error)
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !["ADMIN", "RISK_OWNER"].includes(session.user?.role || "")) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      )
    }

    const { id } = await params
    const body = await request.json()
    const validatedData = unitKerjaSchema.parse(body)

    // Check if code already exists (excluding current record)
    const existingUnit = await prisma.unitKerja.findFirst({
      where: {
        code: validatedData.code,
        NOT: {
          id: parseInt(id)
        }
      }
    })

    if (existingUnit) {
      return NextResponse.json(
        { message: "Kode unit kerja sudah digunakan" },
        { status: 400 }
      )
    }

    const unitKerja = await prisma.unitKerja.update({
      where: { id: parseInt(id) },
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

    return NextResponse.json(unitKerja)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: "Validation error", errors: error.issues },
        { status: 400 }
      )
    }

    console.error("Error updating unit kerja:", error)
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user?.role !== "ADMIN") {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      )
    }

    const { id } = await params
    
    // Check if unit is in use
    const usageCount = await prisma.unitKerja.findUnique({
      where: { id: parseInt(id) },
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

    if (!usageCount) {
      return NextResponse.json(
        { message: "Unit kerja not found" },
        { status: 404 }
      )
    }

    const totalUsage = usageCount._count.users + usageCount._count.Risiko + usageCount._count.SasaranStrategis

    if (totalUsage > 0) {
      return NextResponse.json(
        { message: "Cannot delete unit kerja that is in use" },
        { status: 400 }
      )
    }

    await prisma.unitKerja.delete({
      where: { id: parseInt(id) }
    })

    return NextResponse.json({ message: "Unit kerja deleted successfully" })
  } catch (error) {
    console.error("Error deleting unit kerja:", error)
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    )
  }
}