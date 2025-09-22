"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { RisksTable, RiskOverviewCards } from "@/components/risks"
import { Plus, BarChart3, Grid, FileText } from "lucide-react"
import { toast } from "sonner"

interface Risk {
  id: number
  riskNumber: string
  namaRisiko: string
  kategori: {
    categoryBUMN: string
  }
  ownerUnit: {
    name: string
  }
  risikoInheren?: {
    inherenLevel: string
    inherenExposure: number
  }
  risikoResidual?: {
    residualLevel: string
    residualExposure: number
  }
  createdAt: string
}

interface RiskOverviewData {
  totalRisks: number
  highRisks: number
  newRisks: number
  assessedRisks: number
  overdueTreatments: number
  riskTrend: 'up' | 'down' | 'stable'
  complianceScore: number
}

export default function RisksPage() {
  const router = useRouter()
  const [risks, setRisks] = useState<Risk[]>([])
  const [overviewData, setOverviewData] = useState<RiskOverviewData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [view, setView] = useState<'table' | 'matrix'>('table')

  useEffect(() => {
    loadRisks()
    loadOverviewData()
  }, [])

  const loadRisks = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/risks')
      
      if (!response.ok) {
        throw new Error('Failed to fetch risks')
      }
      
      const data = await response.json()
      setRisks(data.data || [])
    } catch (error) {
      console.error('Error loading risks:', error)
      toast.error('Gagal memuat data risiko')
    } finally {
      setIsLoading(false)
    }
  }

  const loadOverviewData = async () => {
    try {
      // Calculate overview data from risks or fetch from API
      const response = await fetch('/api/risks')
      if (response.ok) {
        const data = await response.json()
        const risksList = data.data || []
        
        const totalRisks = risksList.length
        const highRisks = risksList.filter((r: Risk) => 
          r.risikoResidual?.residualLevel === 'HIGH' || r.risikoResidual?.residualLevel === 'VERY_HIGH'
        ).length
        const newRisks = risksList.filter((r: Risk) => {
          const created = new Date(r.createdAt)
          const oneMonthAgo = new Date()
          oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1)
          return created > oneMonthAgo
        }).length
        const assessedRisks = risksList.filter((r: Risk) => 
          r.risikoResidual !== undefined
        ).length
        
        setOverviewData({
          totalRisks,
          highRisks,
          newRisks,
          assessedRisks,
          overdueTreatments: 0, // This would need treatment data
          riskTrend: newRisks > 0 ? 'up' : 'stable',
          complianceScore: totalRisks > 0 ? Math.round((assessedRisks / totalRisks) * 100) : 0
        })
      }
    } catch (error) {
      console.error('Error loading overview data:', error)
    }
  }

  const handleEdit = (id: number) => {
    router.push(`/risks/${id}/edit`)
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Yakin ingin menghapus risiko ini?')) return
    
    try {
      const response = await fetch(`/api/risks/${id}`, {
        method: 'DELETE'
      })
      
      if (!response.ok) {
        throw new Error('Failed to delete risk')
      }
      
      toast.success('Risiko berhasil dihapus')
      loadRisks()
      loadOverviewData()
    } catch (error) {
      console.error('Error deleting risk:', error)
      toast.error('Gagal menghapus risiko')
    }
  }

  const handleAssess = (id: number) => {
    router.push(`/risks/${id}/assessment`)
  }

  const handleView = (id: number) => {
    router.push(`/risks/${id}`)
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Risk Register</h1>
          <p className="text-muted-foreground">
            Manajemen dan pemantauan risiko organisasi
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={() => router.push('/risks/analytics')}>
            <BarChart3 className="w-4 h-4 mr-2" />
            Analytics
          </Button>
          <Button variant="outline" size="sm" onClick={() => router.push('/risks/matrix')}>
            <Grid className="w-4 h-4 mr-2" />
            Matrix
          </Button>
          <Button onClick={() => router.push('/risks/create')}>
            <Plus className="w-4 h-4 mr-2" />
            Tambah Risiko
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <RiskOverviewCards 
        data={overviewData || undefined}
        isLoading={isLoading}
      />

      {/* View Toggle */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Daftar Risiko</CardTitle>
            <div className="flex items-center space-x-2">
              <Button 
                variant={view === 'table' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setView('table')}
              >
                <FileText className="w-4 h-4 mr-2" />
                Table View
              </Button>
              <Button 
                variant={view === 'matrix' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setView('matrix')}
              >
                <Grid className="w-4 h-4 mr-2" />
                Matrix View
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {view === 'table' ? (
            <RisksTable
              risks={risks}
              isLoading={isLoading}
            />
          ) : (
            <div className="text-center py-8">
              <Grid className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Matrix View</h3>
              <p className="text-muted-foreground mb-4">
                Tampilan matrix akan menampilkan risiko dalam format grid 5x5
              </p>
              <Button onClick={() => router.push('/risks/matrix')}>
                Lihat Risk Matrix
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Status Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {['ASSESSED', 'NOT_ASSESSED'].map((status) => {
                const count = status === 'ASSESSED' 
                  ? risks.filter(r => r.risikoResidual !== undefined).length
                  : risks.filter(r => r.risikoResidual === undefined).length
                const percentage = risks.length > 0 ? (count / risks.length) * 100 : 0
                return (
                  <div key={status} className="flex justify-between text-sm">
                    <span>{status === 'ASSESSED' ? 'SUDAH DINILAI' : 'BELUM DINILAI'}</span>
                    <span className="font-medium">
                      {count} ({percentage.toFixed(0)}%)
                    </span>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Risk Level Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {['VERY_HIGH', 'HIGH', 'MODERATE', 'LOW', 'VERY_LOW'].map((level) => {
                const count = risks.filter(r => r.risikoResidual?.residualLevel === level).length
                const percentage = risks.length > 0 ? (count / risks.length) * 100 : 0
                const levelText = level === 'VERY_HIGH' ? 'SANGAT TINGGI' :
                                level === 'HIGH' ? 'TINGGI' :
                                level === 'MODERATE' ? 'SEDANG' :
                                level === 'LOW' ? 'RENDAH' : 'SANGAT RENDAH'
                return (
                  <div key={level} className="flex justify-between text-sm">
                    <span>{levelText}</span>
                    <span className="font-medium">
                      {count} ({percentage.toFixed(0)}%)
                    </span>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Risk Type Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {Array.from(new Set(risks.map(r => r.kategori.categoryBUMN))).map((type) => {
                const count = risks.filter(r => r.kategori.categoryBUMN === type).length
                const percentage = risks.length > 0 ? (count / risks.length) * 100 : 0
                return (
                  <div key={type} className="flex justify-between text-sm">
                    <span>{type}</span>
                    <span className="font-medium">
                      {count} ({percentage.toFixed(0)}%)
                    </span>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}