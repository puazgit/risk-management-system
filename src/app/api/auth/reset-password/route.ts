import { NextResponse } from "next/server"
import bcryptjs from "bcryptjs"
import { z } from "zod"
import { prisma } from "@/lib/prisma"

// Schema validasi
const resetPasswordSchema = z.object({
  token: z.string(),
  password: z.string().min(6, "Password minimal 6 karakter"),
})

export async function POST(request: Request) {
  try {
    const body = await request.json()
    
    // Validasi data
    const validatedData = resetPasswordSchema.parse(body)
    const { token, password } = validatedData

    // Cari user berdasarkan reset token
    const user = await prisma.authUser.findFirst({
      where: {
        resetToken: token,
        resetTokenExpiry: {
          gt: new Date(), // Token belum expired
        },
      }
    })

    if (!user) {
      return NextResponse.json(
        { message: "Token tidak valid atau sudah kedaluwarsa" },
        { status: 400 }
      )
    }

    // Hash password baru
    const hashedPassword = await bcryptjs.hash(password, 12)

    // Update password dan hapus reset token
    await prisma.authUser.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetToken: null,
        resetTokenExpiry: null,
      }
    })

    return NextResponse.json(
      { message: "Password berhasil direset" },
      { status: 200 }
    )

  } catch (error) {
    console.error("Reset password error:", error)

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