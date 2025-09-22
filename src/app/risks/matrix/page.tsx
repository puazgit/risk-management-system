"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { RiskMatrix } from "@/components/risks"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Grid, FileText, BarChart3 } from "lucide-react"
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
    probability: number
    impact: number
  }
  risikoResidual?: {
    residualLevel: string
    residualExposure: number
    probability: number
    impact: number
  }
}

export default function RiskMatrixPage() {
  const router = useRouter()
  const [risks, setRisks] = useState<Risk[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [viewType, setViewType] = useState<'inherent' | 'residual'>('residual')

  useEffect(() => {
    loadRisks()
  }, [])

  const loadRisks = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/risks')
      
      if (!response.ok) {
        throw new Error('Failed to fetch risks')
      }
      
      const data = await response.json()
      setRisks(data.risks || [])
    } catch (error) {
      console.error('Error loading risks:', error)
      toast.error('Gagal memuat data risiko')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCellClick = (level: string) => {
    const filterText = level.toLowerCase().replace('_', ' ')
    console.log(`Filter risks by level: ${filterText}`)
    // You can implement filtering here
  }

  // Get all assessed risks with their levels first
  const assessedRisks = risks
    .filter(risk => viewType === 'inherent' ? risk.risikoInheren : risk.risikoResidual)
    .map(risk => {
      const assessment = viewType === 'inherent' ? risk.risikoInheren! : risk.risikoResidual!
      const level = viewType === 'inherent' 
        ? (assessment as any).inherenLevel 
        : (assessment as any).residualLevel
      return {
        ...risk,
        level,
        category: risk.kategori.categoryBUMN
      }
    })

  // Transform risks data for the matrix component
  const matrixData = {
    type: viewType,
    matrixGrid: (() => {
      // Create 5x5 matrix grid
      const grid = []
      for (let probability = 1; probability <= 5; probability++) {
        const row = []
        for (let impact = 1; impact <= 5; impact++) {
          const exposure = probability * impact
          let level = "VERY_LOW"
          if (exposure >= 20) level = "VERY_HIGH"
          else if (exposure >= 15) level = "HIGH"
          else if (exposure >= 10) level = "MODERATE"
          else if (exposure >= 5) level = "LOW"
          
          const cellRisks = risks
            .filter(risk => {
              const assessment = viewType === 'inherent' ? risk.risikoInheren : risk.risikoResidual
              return assessment && assessment.probability === probability && assessment.impact === impact
            })
            .map(risk => ({
              id: risk.id,
              riskNumber: risk.riskNumber || '',
              namaRisiko: risk.namaRisiko,
              kategori: risk.kategori.categoryBUMN,
              unit: risk.ownerUnit.name
            }))
          
          row.push({
            impact,
            probability,
            exposure,
            level,
            risks: cellRisks,
            count: cellRisks.length
          })
        }
        grid.push(row)
      }
      return grid
    })(),
    levelStats: {
      VERY_HIGH: assessedRisks.filter(r => r.level === 'VERY_HIGH').length,
      HIGH: assessedRisks.filter(r => r.level === 'HIGH').length,
      MODERATE: assessedRisks.filter(r => r.level === 'MODERATE').length,
      LOW: assessedRisks.filter(r => r.level === 'LOW').length,
      VERY_LOW: assessedRisks.filter(r => r.level === 'VERY_LOW').length,
    },
    totalRisks: risks.length
  }

  // Calculate statistics
  const totalAssessed = assessedRisks.length
  const highRisks = assessedRisks.filter(r => r.level === 'VERY_HIGH' || r.level === 'HIGH').length
  const moderateRisks = assessedRisks.filter(r => r.level === 'MODERATE').length
  const lowRisks = assessedRisks.filter(r => r.level === 'LOW' || r.level === 'VERY_LOW').length

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => router.back()}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Kembali
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Risk Matrix</h1>
            <p className="text-muted-foreground">
              Visualisasi risiko dalam matriks 5x5
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant={viewType === 'inherent' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewType('inherent')}
          >
            Risiko Inheren
          </Button>
          <Button
            variant={viewType === 'residual' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewType('residual')}
          >
            Risiko Residual
          </Button>
          <Button variant="outline" size="sm" onClick={() => router.push('/risks')}>
            <FileText className="w-4 h-4 mr-2" />
            Tabel View
          </Button>
        </div>
      </div>

      {/* Statistics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Dinilai</p>
                <p className="text-2xl font-bold">{totalAssessed}</p>
              </div>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Risiko Tinggi</p>
                <p className="text-2xl font-bold text-red-600">{highRisks}</p>
              </div>
              <div className="h-4 w-4 bg-red-500 rounded-full" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Risiko Sedang</p>
                <p className="text-2xl font-bold text-yellow-600">{moderateRisks}</p>
              </div>
              <div className="h-4 w-4 bg-yellow-500 rounded-full" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Risiko Rendah</p>
                <p className="text-2xl font-bold text-green-600">{lowRisks}</p>
              </div>
              <div className="h-4 w-4 bg-green-500 rounded-full" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Risk Matrix */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Grid className="w-5 h-5" />
            Risk Matrix - {viewType === 'inherent' ? 'Risiko Inheren' : 'Risiko Residual'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <RiskMatrix
            data={matrixData}
            isLoading={isLoading}
            onTypeChange={(type) => setViewType(type)}
          />
        </CardContent>
      </Card>

      {/* Risk Distribution by Category */}
      <Card>
        <CardHeader>
          <CardTitle>Distribusi Risiko per Kategori</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from(new Set(assessedRisks.map(r => r.category))).map((category: string) => {
              const categoryRisks = assessedRisks.filter(r => r.category === category)
              const highCount = categoryRisks.filter(r => r.level === 'VERY_HIGH' || r.level === 'HIGH').length
              const moderateCount = categoryRisks.filter(r => r.level === 'MODERATE').length
              const lowCount = categoryRisks.filter(r => r.level === 'LOW' || r.level === 'VERY_LOW').length
              
              return (
                <div key={category} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium">{category}</h4>
                    <span className="text-sm text-muted-foreground">
                      {categoryRisks.length} risiko
                    </span>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-red-500 rounded-full" />
                      <span className="text-sm">Tinggi: {highCount}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-yellow-500 rounded-full" />
                      <span className="text-sm">Sedang: {moderateCount}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full" />
                      <span className="text-sm">Rendah: {lowCount}</span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Legend and Guidelines */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Legenda Matrix</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 bg-red-500 rounded flex items-center justify-center text-white text-xs font-bold">
                  5
                </div>
                <div>
                  <div className="font-medium">Sangat Tinggi (20-25)</div>
                  <div className="text-sm text-muted-foreground">Tindakan segera diperlukan</div>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 bg-orange-500 rounded flex items-center justify-center text-white text-xs font-bold">
                  4
                </div>
                <div>
                  <div className="font-medium">Tinggi (15-19)</div>
                  <div className="text-sm text-muted-foreground">Perlu perhatian khusus</div>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 bg-yellow-500 rounded flex items-center justify-center text-white text-xs font-bold">
                  3
                </div>
                <div>
                  <div className="font-medium">Sedang (10-14)</div>
                  <div className="text-sm text-muted-foreground">Pemantauan rutin</div>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 bg-green-500 rounded flex items-center justify-center text-white text-xs font-bold">
                  2
                </div>
                <div>
                  <div className="font-medium">Rendah (5-9)</div>
                  <div className="text-sm text-muted-foreground">Pemantauan berkala</div>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 bg-blue-500 rounded flex items-center justify-center text-white text-xs font-bold">
                  1
                </div>
                <div>
                  <div className="font-medium">Sangat Rendah (1-4)</div>
                  <div className="text-sm text-muted-foreground">Dapat diterima</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Panduan Penggunaan</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm">
              <div>
                <div className="font-medium mb-1">Cara Membaca Matrix:</div>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• Sumbu X: Dampak (Impact) 1-5</li>
                  <li>• Sumbu Y: Probabilitas (Likelihood) 1-5</li>
                  <li>• Warna menunjukkan tingkat risiko</li>
                  <li>• Angka dalam sel = jumlah risiko</li>
                </ul>
              </div>
              <div>
                <div className="font-medium mb-1">Interaksi:</div>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• Klik sel untuk melihat detail risiko</li>
                  <li>• Hover untuk informasi tambahan</li>
                  <li>• Toggle antara inheren dan residual</li>
                </ul>
              </div>
              <div>
                <div className="font-medium mb-1">Tindak Lanjut:</div>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• Fokus pada risiko tinggi dan sangat tinggi</li>
                  <li>• Review strategi mitigasi</li>
                  <li>• Monitor perubahan level risiko</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}