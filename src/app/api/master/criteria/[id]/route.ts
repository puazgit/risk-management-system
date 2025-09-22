import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const kriteriaRisikoSchema = z.object({
  type: z.enum(["DAMPAK", "PROBABILITAS"], {
    message: "Type harus dipilih (DAMPAK atau PROBABILITAS)"
  }),
  scale: z.string().min(1, "Scale harus diisi"),
  value: z.number().min(1).max(5, "Value harus antara 1-5"),
  description: z.string().optional()
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
    const criteria = await prisma.kriteriaRisiko.findUnique({
      where: { id: parseInt(id) }
    })

    if (!criteria) {
      return NextResponse.json(
        { message: "Criteria not found" },
        { status: 404 }
      )
    }

    return NextResponse.json(criteria)
  } catch (error) {
    console.error("Error fetching criteria:", error)
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
    const validatedData = kriteriaRisikoSchema.parse(body)

    // Check if value already exists for this type (excluding current record)
    const existingCriteria = await prisma.kriteriaRisiko.findFirst({
      where: {
        type: validatedData.type,
        value: validatedData.value,
        NOT: {
          id: parseInt(id)
        }
      }
    })

    if (existingCriteria) {
      return NextResponse.json(
        { message: `Value ${validatedData.value} sudah ada untuk type ${validatedData.type}` },
        { status: 400 }
      )
    }

    const criteria = await prisma.kriteriaRisiko.update({
      where: { id: parseInt(id) },
      data: validatedData
    })

    return NextResponse.json(criteria)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: "Validation error", errors: error.issues },
        { status: 400 }
      )
    }

    console.error("Error updating criteria:", error)
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
    
    await prisma.kriteriaRisiko.delete({
      where: { id: parseInt(id) }
    })

    return NextResponse.json({ message: "Criteria deleted successfully" })
  } catch (error) {
    console.error("Error deleting criteria:", error)
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    )
  }
}