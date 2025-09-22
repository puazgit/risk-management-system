import { NextResponse, NextRequest } from "next/server"
import { getServerSession } from "next-auth"
import bcryptjs from "bcryptjs"
import { z } from "zod"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// Schema for user update
const updateUserSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  role: z.enum(["USER", "ADMIN", "RISK_OWNER", "LINI_KEDUA", "SPI", "DIREKSI", "DEWAN_PENGAWAS"]),
  password: z.string().min(6, "Password must be at least 6 characters").optional(),
})

// GET - Get single user by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    const session = await getServerSession(authOptions)
    
    if (!session || session.user?.role !== "ADMIN") {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      )
    }

    const user = await prisma.authUser.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true
      }
    })

    if (!user) {
      return NextResponse.json(
        { message: "User not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({ user })
    
  } catch (error) {
    console.error("Get user error:", error)
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    )
  }
}

// PUT - Update user
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await getServerSession(authOptions)
    
    if (!session || session.user?.role !== "ADMIN") {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      )
    }

    // Check if user exists
    const existingUser = await prisma.authUser.findUnique({
      where: { id }
    })

    if (!existingUser) {
      return NextResponse.json(
        { message: "User not found" },
        { status: 404 }
      )
    }

    const body = await request.json()
    const validatedData = updateUserSchema.parse(body)

    // Check if email is taken by another user
    if (validatedData.email !== existingUser.email) {
      const emailExists = await prisma.authUser.findUnique({
        where: { email: validatedData.email }
      })

      if (emailExists) {
        return NextResponse.json(
          { message: "Email already exists" },
          { status: 400 }
        )
      }
    }

    // Prepare update data
    const updateData: any = {
      name: validatedData.name,
      email: validatedData.email,
      role: validatedData.role
    }

    // Hash new password if provided
    if (validatedData.password) {
      updateData.password = await bcryptjs.hash(validatedData.password, 12)
    }

    // Update user
    const user = await prisma.authUser.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        updatedAt: true
      }
    })

    return NextResponse.json(
      { message: "User updated successfully", user }
    )
    
  } catch (error) {
    console.error("Update user error:", error)
    
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

// DELETE - Delete user
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await getServerSession(authOptions)
    
    if (!session || session.user?.role !== "ADMIN") {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      )
    }

    // Check if user exists
    const existingUser = await prisma.authUser.findUnique({
      where: { id }
    })

    if (!existingUser) {
      return NextResponse.json(
        { message: "User not found" },
        { status: 404 }
      )
    }

    // Prevent deleting yourself
    if (id === session.user?.id) {
      return NextResponse.json(
        { message: "Cannot delete your own account" },
        { status: 400 }
      )
    }

    // Delete user
    await prisma.authUser.delete({
      where: { id }
    })

    return NextResponse.json(
      { message: "User deleted successfully" }
    )
    
  } catch (error) {
    console.error("Delete user error:", error)
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    )
  }
}