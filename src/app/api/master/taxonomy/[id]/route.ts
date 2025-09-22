import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const taksonomiRisikoSchema = z.object({
  categoryBUMN: z.string().min(1, "Kategori BUMN harus diisi"),
  categoryT2T3KBUMN: z.string().min(1, "Kategori T2T3K BUMN harus diisi"),
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
    const taxonomy = await prisma.taksonomiRisiko.findUnique({
      where: { id: parseInt(id) },
      include: {
        _count: {
          select: {
            Risiko: true
          }
        }
      }
    })

    if (!taxonomy) {
      return NextResponse.json(
        { message: "Taxonomy not found" },
        { status: 404 }
      )
    }

    return NextResponse.json(taxonomy)
  } catch (error) {
    console.error("Error fetching taxonomy:", error)
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
    const validatedData = taksonomiRisikoSchema.parse(body)

    const taxonomy = await prisma.taksonomiRisiko.update({
      where: { id: parseInt(id) },
      data: validatedData
    })

    return NextResponse.json(taxonomy)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: "Validation error", errors: error.issues },
        { status: 400 }
      )
    }

    console.error("Error updating taxonomy:", error)
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
    
    // Check if taxonomy is in use
    const risksCount = await prisma.risiko.count({
      where: { kategoriId: parseInt(id) }
    })

    if (risksCount > 0) {
      return NextResponse.json(
        { message: "Cannot delete taxonomy that is in use by risks" },
        { status: 400 }
      )
    }

    await prisma.taksonomiRisiko.delete({
      where: { id: parseInt(id) }
    })

    return NextResponse.json({ message: "Taxonomy deleted successfully" })
  } catch (error) {
    console.error("Error deleting taxonomy:", error)
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    )
  }
}