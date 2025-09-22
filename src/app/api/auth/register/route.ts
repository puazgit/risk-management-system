import { NextResponse } from "next/server"
import bcryptjs from "bcryptjs"
import { z } from "zod"
import { prisma } from "@/lib/prisma"

// Schema validasi
const registerSchema = z.object({
  name: z.string().min(2, "Nama minimal 2 karakter"),
  email: z.string().email("Email tidak valid"),
  password: z.string().min(6, "Password minimal 6 karakter"),
})

export async function POST(request: Request) {
  try {
    const body = await request.json()
    
    // Validasi data
    const validatedData = registerSchema.parse(body)
    const { name, email, password } = validatedData

    // Cek apakah email sudah digunakan
    const existingUser = await prisma.authUser.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json(
        { message: "Email sudah digunakan" },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await bcryptjs.hash(password, 12)

    // Buat user baru
    const user = await prisma.authUser.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: "USER", // Default role
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      }
    })

    return NextResponse.json(
      { 
        message: "User berhasil dibuat",
        user 
      },
      { status: 201 }
    )

  } catch (error) {
    console.error("Register error:", error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: "Data tidak valid", errors: error.issues },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    )
  }
}