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

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      )
    }

    const taxonomies = await prisma.taksonomiRisiko.findMany({
      orderBy: { categoryBUMN: "asc" },
      include: {
        _count: {
          select: {
            Risiko: true
          }
        }
      }
    })

    return NextResponse.json({
      data: taxonomies,
      total: taxonomies.length
    })
  } catch (error) {
    console.error("Error fetching taxonomies:", error)
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
    const validatedData = taksonomiRisikoSchema.parse(body)

    const taxonomy = await prisma.taksonomiRisiko.create({
      data: validatedData
    })

    return NextResponse.json(taxonomy, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: "Validation error", errors: error.issues },
        { status: 400 }
      )
    }

    console.error("Error creating taxonomy:", error)
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    )
  }
}