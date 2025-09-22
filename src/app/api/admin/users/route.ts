import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import bcryptjs from "bcryptjs"
import { z } from "zod"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// Schema for user creation/update
const userSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  role: z.enum(["USER", "ADMIN", "RISK_OWNER", "LINI_KEDUA", "SPI", "DIREKSI", "DEWAN_PENGAWAS"]),
  password: z.string().min(6, "Password must be at least 6 characters").optional(),
})

// GET - List all users with pagination and search
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user?.role !== "ADMIN") {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "10")
    const search = searchParams.get("search") || ""
    const role = searchParams.get("role") || ""

    const skip = (page - 1) * limit

    // Build where clause
    const where: any = {}
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } }
      ]
    }
    
    if (role) {
      where.role = role
    }

    // Get users and total count
    const [users, total] = await Promise.all([
      prisma.authUser.findMany({
        where,
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          createdAt: true,
          updatedAt: true
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit
      }),
      prisma.authUser.count({ where })
    ])

    const totalPages = Math.ceil(total / limit)

    return NextResponse.json({
      users,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasMore: page < totalPages
      }
    })
    
  } catch (error) {
    console.error("Get users error:", error)
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    )
  }
}

// POST - Create new user
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user?.role !== "ADMIN") {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      )
    }

    const body = await request.json()
    const validatedData = userSchema.parse(body)

    // Check if email already exists
    const existingUser = await prisma.authUser.findUnique({
      where: { email: validatedData.email }
    })

    if (existingUser) {
      return NextResponse.json(
        { message: "Email already exists" },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await bcryptjs.hash(validatedData.password || "defaultpassword123", 12)

    // Create user
    const user = await prisma.authUser.create({
      data: {
        name: validatedData.name,
        email: validatedData.email,
        role: validatedData.role,
        password: hashedPassword
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true
      }
    })

    return NextResponse.json(
      { message: "User created successfully", user },
      { status: 201 }
    )
    
  } catch (error) {
    console.error("Create user error:", error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: "Validation error", errors: error.issues },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    )
  }
}