import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { SiteHeader } from "@/components/site-header"

export default function Home() {
  return (
    <>
      <SiteHeader />
      <main className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto text-center">
        <h1 className="text-4xl font-bold tracking-tight mb-4">
          Aplikasi Manajemen Risiko
        </h1>
        <p className="text-xl text-muted-foreground mb-8">
          Solusi modern untuk mengelola dan memantau risiko organisasi dengan teknologi terdepan
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>🔐 Authentication</CardTitle>
              <CardDescription>
                Sistem autentikasi yang aman dengan NextAuth.js
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex gap-2">
                <Button asChild className="flex-1">
                  <Link href="/login">Login</Link>
                </Button>
                <Button asChild variant="outline" className="flex-1">
                  <Link href="/register">Register</Link>
                </Button>
              </div>
              <Button asChild variant="ghost" className="w-full">
                <Link href="/forgot-password">Lupa Password?</Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>📊 Dashboard</CardTitle>
              <CardDescription>
                Panel kontrol untuk mengelola semua aspek risiko
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full">
                <Link href="/dashboard">Ke Dashboard</Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">🎯 Risk Assessment</CardTitle>
              <CardDescription>
                Penilaian komprehensif terhadap risiko organisasi
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">📈 Risk Monitoring</CardTitle>
              <CardDescription>
                Pemantauan real-time dan analisis tren risiko
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">📋 Compliance</CardTitle>
              <CardDescription>
                Manajemen kepatuhan dan audit trail lengkap
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        <Card className="bg-muted/50">
          <CardHeader>
            <CardTitle>🚀 Tech Stack</CardTitle>
            <CardDescription>
              Aplikasi ini dibangun dengan teknologi modern dan terpercaya
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="text-center">
                <div className="font-semibold">Next.js 15</div>
                <div className="text-muted-foreground">React Framework</div>
              </div>
              <div className="text-center">
                <div className="font-semibold">PostgreSQL</div>
                <div className="text-muted-foreground">Database</div>
              </div>
              <div className="text-center">
                <div className="font-semibold">Prisma ORM</div>
                <div className="text-muted-foreground">Type-safe ORM</div>
              </div>
              <div className="text-center">
                <div className="font-semibold">NextAuth.js</div>
                <div className="text-muted-foreground">Authentication</div>
              </div>
              <div className="text-center">
                <div className="font-semibold">Shadcn UI</div>
                <div className="text-muted-foreground">UI Components</div>
              </div>
              <div className="text-center">
                <div className="font-semibold">Tailwind CSS</div>
                <div className="text-muted-foreground">Styling</div>
              </div>
              <div className="text-center">
                <div className="font-semibold">Zod</div>
                <div className="text-muted-foreground">Validation</div>
              </div>
              <div className="text-center">
                <div className="font-semibold">TypeScript</div>
                <div className="text-muted-foreground">Type Safety</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
    </>
  )
}