"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import Link from "next/link"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"

// Schema validasi untuk forgot password
const forgotPasswordSchema = z.object({
  email: z.string().email("Email tidak valid"),
})

type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [isEmailSent, setIsEmailSent] = useState(false)

  const form = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  })

  const onSubmit = async (data: ForgotPasswordFormValues) => {
    setIsLoading(true)
    
    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      if (response.ok) {
        setIsEmailSent(true)
        toast.success("Link reset password telah dikirim ke email Anda")
      } else {
        const errorData = await response.json()
        toast.error(errorData.message || "Terjadi kesalahan")
      }
    } catch (error) {
      console.error("Forgot password error:", error)
      toast.error("Terjadi kesalahan jaringan")
    } finally {
      setIsLoading(false)
    }
  }

  if (isEmailSent) {
    return (
      <div className="container mx-auto flex h-screen w-screen flex-col items-center justify-center">
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
          <Card>
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl text-center">Email Terkirim</CardTitle>
              <CardDescription className="text-center">
                Kami telah mengirim link reset password ke email Anda
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-lg border bg-muted p-4">
                <div className="flex">
                  <div className="ml-3">
                    <h3 className="text-sm font-medium">Periksa email Anda</h3>
                    <div className="mt-2 text-sm text-muted-foreground">
                      <p>
                        Kami telah mengirim link reset password ke{" "}
                        <span className="font-medium">{form.getValues("email")}</span>.
                        Klik link tersebut untuk mengatur ulang password Anda.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="text-center">
                <p className="text-sm text-muted-foreground">
                  Tidak menerima email?{" "}
                  <button
                    onClick={() => {
                      setIsEmailSent(false)
                      form.reset()
                    }}
                    className="text-primary underline-offset-4 hover:underline"
                  >
                    Kirim ulang
                  </button>
                </p>
              </div>

              <div className="text-center">
                <Link
                  href="/login"
                  className="text-sm text-primary underline-offset-4 hover:underline"
                >
                  Kembali ke halaman login
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto flex h-screen w-screen flex-col items-center justify-center">
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center">Lupa Password</CardTitle>
            <CardDescription className="text-center">
              Masukkan email Anda dan kami akan mengirim link untuk reset password
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="nama@contoh.com"
                          type="email"
                          autoCapitalize="none"
                          autoComplete="email"
                          autoCorrect="off"
                          disabled={isLoading}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Mengirim..." : "Kirim Link Reset Password"}
                </Button>
              </form>
            </Form>

            <div className="relative mt-6">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  Atau
                </span>
              </div>
            </div>

            <div className="mt-6 space-y-2 text-center">
              <Link
                href="/login"
                className="text-sm text-primary underline-offset-4 hover:underline"
              >
                Kembali ke halaman login
              </Link>
              <br />
              <Link
                href="/register"
                className="text-sm text-muted-foreground underline-offset-4 hover:underline"
              >
                Belum punya akun? Daftar sekarang
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}