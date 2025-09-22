"use client"

import { useSession, signOut } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DashboardHeader } from "@/components/dashboard-header"
import { RiskOverviewCards } from "@/components/dashboard/risk-overview-cards"
import { RiskMatrixHeatmap } from "@/components/dashboard/risk-matrix-heatmap"
import { KRIAlerts } from "@/components/dashboard/kri-alerts"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"

interface DashboardStats {
  overview: {
    totalRisks: number
    pendingAssessments: number
    activeRisks: number
  }
  riskLevelDistribution: Array<{
    level: string
    count: number
    percentage: number
  }>
  categoryStats: Array<{
    categoryId: number | null
    categoryName: string
    count: number
  }>
  recentRisks: Array<{
    id: number
    namaRisiko: string
    createdAt: string
    kategori: {
      categoryBUMN: string
    }
  }>
  trends: {
    newRisksThisMonth: number
  }
}

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
    }
  }, [status, router])

  useEffect(() => {
    if (status === "authenticated") {
      loadDashboardStats()
    }
  }, [status])

  const loadDashboardStats = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/dashboard/stats')
      
      if (!response.ok) {
        throw new Error('Failed to fetch dashboard stats')
      }
      
      const data = await response.json()
      setStats(data)
    } catch (error) {
      console.error('Error loading dashboard stats:', error)
      toast.error('Gagal memuat data dashboard')
    } finally {
      setIsLoading(false)
    }
  }

  if (status === "loading" || isLoading) {
    return (
      <>
        <DashboardHeader />
        <div className="container px-4 py-8 mx-auto">
          <div className="max-w-6xl mx-auto">
            <Card className="mb-8">
              <CardContent className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
              </CardContent>
            </Card>
          </div>
        </div>
      </>
    )
  }

  if (status === "unauthenticated") {
    return null
  }

  return (
    <>
      <DashboardHeader />
      <div className="container px-4 py-8 mx-auto">
        <div className="max-w-6xl mx-auto">
          {/* Welcome Card */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="text-3xl">Dashboard Manajemen Risiko</CardTitle>
              <CardDescription>
                Selamat datang, {session?.user?.name || session?.user?.email}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">
                    Status: Berhasil masuk ke sistem
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Email: {session?.user?.email}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Role: {session?.user?.role}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Risk Overview Cards */}
          {stats && (
            <RiskOverviewCards stats={stats} />
          )}

          {/* Main Dashboard Grid */}
          <div className="grid grid-cols-1 gap-8 mb-8 lg:grid-cols-3">
            {/* Risk Matrix Heatmap */}
            <div className="lg:col-span-2">
              {stats && (
                <RiskMatrixHeatmap distribution={stats.riskLevelDistribution} />
              )}
            </div>

            {/* KRI Alerts */}
            <div className="lg:col-span-1">
              {stats && (
                <KRIAlerts stats={stats} />
              )}
            </div>
          </div>

          {/* Quick Actions Grid */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card className="transition-shadow hover:shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg">Manajemen Risiko</CardTitle>
                <CardDescription>
                  Kelola dan monitor risiko organisasi
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full" asChild>
                  <Link href="/risks">
                    Kelola Risiko
                  </Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="transition-shadow hover:shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg">Assessment Risiko</CardTitle>
                <CardDescription>
                  Lakukan penilaian dan evaluasi risiko
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full" asChild>
                  <Link href="/risks/create">
                    Tambah Risiko Baru
                  </Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="transition-shadow hover:shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg">Risk Matrix</CardTitle>
                <CardDescription>
                  Visualisasi matriks risiko
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full" asChild>
                  <Link href="/risks/matrix">
                    Lihat Matrix
                  </Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="transition-shadow hover:shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg">Master Data</CardTitle>
                <CardDescription>
                  Kelola data master sistem manajemen risiko
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Button className="w-full" asChild>
                    <Link href="/master">
                      Kelola Master Data
                    </Link>
                  </Button>
                  <div className="grid grid-cols-2 gap-2">
                    <Button variant="outline" size="sm" asChild>
                      <Link href="/master?tab=kri">
                        KRI
                      </Link>
                    </Button>
                    <Button variant="outline" size="sm" asChild>
                      <Link href="/master?tab=kontrol">
                        Kontrol
                      </Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="transition-shadow hover:shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg">Users & Permissions</CardTitle>
                <CardDescription>
                  Kelola pengguna dan hak akses
                </CardDescription>
              </CardHeader>
              <CardContent>
                {session?.user?.role === "ADMIN" ? (
                  <Button asChild className="w-full">
                    <Link href="/admin">
                      Go to Admin Panel
                    </Link>
                  </Button>
                ) : (
                  <Button className="w-full" disabled>
                    Admin Only
                  </Button>
                )}
              </CardContent>
            </Card>

            <Card className="transition-shadow hover:shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg">Risk Analytics</CardTitle>
                <CardDescription>
                  Advanced reporting dan trend analysis
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full" asChild>
                  <Link href="/analytics">
                    View Analytics
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  )
}