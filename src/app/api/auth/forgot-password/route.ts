import { NextResponse } from "next/server"
import { z } from "zod"
import { prisma } from "@/lib/prisma"
import crypto from "crypto"

// Schema validasi
const forgotPasswordSchema = z.object({
  email: z.string().email("Email tidak valid"),
})

export async function POST(request: Request) {
  try {
    const body = await request.json()
    
    // Validasi data
    const validatedData = forgotPasswordSchema.parse(body)
    const { email } = validatedData

    // Cari user berdasarkan email
    const user = await prisma.authUser.findUnique({
      where: { email }
    })

    // Selalu return success untuk security (jangan kasih tahu apakah email ada atau tidak)
    if (!user) {
      return NextResponse.json(
        { message: "Jika email terdaftar, link reset password akan dikirim" },
        { status: 200 }
      )
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex')
    const resetTokenExpiry = new Date(Date.now() + 3600000) // 1 hour from now

    // Simpan reset token ke database
    await prisma.authUser.update({
      where: { email },
      data: {
        resetToken,
        resetTokenExpiry,
      }
    })

    // TODO: Implementasi pengiriman email
    // Untuk sementara, kita log token (JANGAN LAKUKAN INI DI PRODUCTION!)
    console.log(`Reset token for ${email}: ${resetToken}`)
    console.log(`Reset URL: ${process.env.NEXTAUTH_URL}/reset-password?token=${resetToken}`)

    return NextResponse.json(
      { message: "Jika email terdaftar, link reset password akan dikirim" },
      { status: 200 }
    )

  } catch (error) {
    console.error("Forgot password error:", error)

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