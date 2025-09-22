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

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get("type")

    const whereClause = type ? { type } : {}

    const criteria = await prisma.kriteriaRisiko.findMany({
      where: whereClause,
      orderBy: [
        { type: "asc" },
        { value: "asc" }
      ]
    })

    return NextResponse.json({
      data: criteria,
      total: criteria.length
    })
  } catch (error) {
    console.error("Error fetching criteria:", error)
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
    const validatedData = kriteriaRisikoSchema.parse(body)

    // Check if value already exists for this type
    const existingCriteria = await prisma.kriteriaRisiko.findFirst({
      where: {
        type: validatedData.type,
        value: validatedData.value
      }
    })

    if (existingCriteria) {
      return NextResponse.json(
        { message: `Value ${validatedData.value} sudah ada untuk type ${validatedData.type}` },
        { status: 400 }
      )
    }

    const criteria = await prisma.kriteriaRisiko.create({
      data: validatedData
    })

    return NextResponse.json(criteria, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: "Validation error", errors: error.issues },
        { status: 400 }
      )
    }

    console.error("Error creating criteria:", error)
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    )
  }
}