"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, Edit, Trash2, BarChart3, FileText, Calendar } from "lucide-react"
import { toast } from "sonner"
import { RiskManagementTabs } from "@/components/risks/risk-management-tabs"

interface Risk {
  id: number
  riskNumber: string
  namaRisiko: string
  deskripsi?: string
  kategori: {
    id: number
    categoryBUMN: string
  }
  ownerUnit: {
    id: number
    name: string
  }
  sasaran: {
    id: number
    name: string
  }
  risikoInheren?: {
    id: number
    inherenLevel: string
    inherenExposure: number
    probability: number
    impact: number
  }
  risikoResidual?: {
    id: number
    residualLevel: string
    residualExposure: number
    probability: number
    impact: number
  }
  createdAt: string
  updatedAt: string
}

function getRiskLevelColor(level: string) {
  switch (level) {
    case "VERY_HIGH":
      return "bg-red-500 text-white"
    case "HIGH":
      return "bg-orange-500 text-white"
    case "MODERATE":
      return "bg-yellow-500 text-white"
    case "LOW":
      return "bg-green-500 text-white"
    case "VERY_LOW":
      return "bg-blue-500 text-white"
    default:
      return "bg-gray-500 text-white"
  }
}

function getRiskLevelText(level: string) {
  switch (level) {
    case "VERY_HIGH":
      return "Sangat Tinggi"
    case "HIGH":
      return "Tinggi"
    case "MODERATE":
      return "Sedang"
    case "LOW":
      return "Rendah"
    case "VERY_LOW":
      return "Sangat Rendah"
    default:
      return level
  }
}

export default function RiskDetailPage() {
  const router = useRouter()
  const params = useParams()
  const id = params?.id as string
  
  const [risk, setRisk] = useState<Risk | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    if (id) {
      loadRisk()
    }
  }, [id])

  const loadRisk = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/risks/${id}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch risk')
      }
      
      const data = await response.json()
      setRisk(data)
    } catch (error) {
      console.error('Error loading risk:', error)
      toast.error('Gagal memuat detail risiko')
    } finally {
      setIsLoading(false)
    }
  }

  const handleEdit = () => {
    router.push(`/risks/${id}/edit`)
  }

  const handleAssessment = () => {
    router.push(`/risks/${id}/assessment`)
  }

  const handleDelete = async () => {
    if (!confirm('Yakin ingin menghapus risiko ini? Tindakan ini tidak dapat dibatalkan.')) {
      return
    }

    try {
      setIsDeleting(true)
      const response = await fetch(`/api/risks/${id}`, {
        method: 'DELETE'
      })
      
      if (!response.ok) {
        throw new Error('Failed to delete risk')
      }
      
      toast.success('Risiko berhasil dihapus')
      router.push('/risks')
    } catch (error) {
      console.error('Error deleting risk:', error)
      toast.error('Gagal menghapus risiko')
    } finally {
      setIsDeleting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto py-6">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="flex items-center space-x-4">
            <div className="h-8 w-20 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-8 w-64 bg-gray-200 rounded animate-pulse"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2].map(i => (
              <Card key={i}>
                <CardHeader>
                  <div className="h-6 w-32 bg-gray-200 rounded animate-pulse"></div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {[1, 2, 3].map(j => (
                    <div key={j} className="h-4 bg-gray-200 rounded animate-pulse"></div>
                  ))}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!risk) {
    return (
      <div className="container mx-auto py-6">
        <div className="max-w-4xl mx-auto text-center">
          <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Risiko Tidak Ditemukan</h2>
          <p className="text-muted-foreground mb-6">
            Risiko yang Anda cari tidak ada atau telah dihapus.
          </p>
          <Button onClick={() => router.push('/risks')}>
            Kembali ke Daftar Risiko
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6">
      <div className="max-w-4xl mx-auto space-y-6">
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
              <h1 className="text-3xl font-bold">{risk.namaRisiko}</h1>
              <p className="text-muted-foreground">
                {risk.riskNumber} • {risk.ownerUnit.name}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" onClick={handleAssessment}>
              <BarChart3 className="w-4 h-4 mr-2" />
              Penilaian
            </Button>
            <Button variant="outline" size="sm" onClick={handleEdit}>
              <Edit className="w-4 h-4 mr-2" />
              Edit
            </Button>
            <Button 
              variant="destructive" 
              size="sm" 
              onClick={handleDelete}
              disabled={isDeleting}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              {isDeleting ? 'Menghapus...' : 'Hapus'}
            </Button>
          </div>
        </div>

        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Informasi Risiko</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Nama Risiko</label>
                  <p className="mt-1">{risk.namaRisiko}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Nomor Risiko</label>
                  <p className="mt-1">{risk.riskNumber}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Kategori</label>
                  <p className="mt-1">{risk.kategori.categoryBUMN}</p>
                </div>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Unit Pemilik</label>
                  <p className="mt-1">{risk.ownerUnit.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Sasaran Strategis</label>
                  <p className="mt-1">{risk.sasaran.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Tanggal Dibuat</label>
                  <p className="mt-1 flex items-center">
                    <Calendar className="w-4 h-4 mr-1" />
                    {new Date(risk.createdAt).toLocaleDateString('id-ID')}
                  </p>
                </div>
              </div>
            </div>
            
            {risk.deskripsi && (
              <>
                <Separator />
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Deskripsi</label>
                  <p className="mt-1 text-sm">{risk.deskripsi}</p>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Risk Assessment */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Inherent Risk */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Risiko Inheren</CardTitle>
            </CardHeader>
            <CardContent>
              {risk.risikoInheren ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Level Risiko</span>
                    <Badge className={getRiskLevelColor(risk.risikoInheren.inherenLevel)}>
                      {getRiskLevelText(risk.risikoInheren.inherenLevel)}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Skor Eksposur</span>
                    <span className="text-2xl font-bold">{risk.risikoInheren.inherenExposure}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Probabilitas</span>
                      <p className="font-medium">{risk.risikoInheren.probability}/5</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Dampak</span>
                      <p className="font-medium">{risk.risikoInheren.impact}/5</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <BarChart3 className="w-8 h-8 mx-auto mb-2" />
                  <p className="text-sm">Belum dinilai</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Residual Risk */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Risiko Residual</CardTitle>
            </CardHeader>
            <CardContent>
              {risk.risikoResidual ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Level Risiko</span>
                    <Badge className={getRiskLevelColor(risk.risikoResidual.residualLevel)}>
                      {getRiskLevelText(risk.risikoResidual.residualLevel)}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Skor Eksposur</span>
                    <span className="text-2xl font-bold">{risk.risikoResidual.residualExposure}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Probabilitas</span>
                      <p className="font-medium">{risk.risikoResidual.probability}/5</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Dampak</span>
                      <p className="font-medium">{risk.risikoResidual.impact}/5</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <BarChart3 className="w-8 h-8 mx-auto mb-2" />
                  <p className="text-sm">Belum dinilai</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Risk Management Integration */}
        <RiskManagementTabs riskId={risk.id} />

        {/* Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Tindakan</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button 
                variant="outline" 
                className="h-auto p-4 flex flex-col items-center space-y-2"
                onClick={handleAssessment}
              >
                <BarChart3 className="w-6 h-6" />
                <div className="text-center">
                  <div className="font-medium">Penilaian Risiko</div>
                  <div className="text-xs text-muted-foreground">
                    Lakukan assessment risiko
                  </div>
                </div>
              </Button>
              
              <Button 
                variant="outline" 
                className="h-auto p-4 flex flex-col items-center space-y-2"
                onClick={handleEdit}
              >
                <Edit className="w-6 h-6" />
                <div className="text-center">
                  <div className="font-medium">Edit Risiko</div>
                  <div className="text-xs text-muted-foreground">
                    Ubah informasi risiko
                  </div>
                </div>
              </Button>

              <Button 
                variant="outline" 
                className="h-auto p-4 flex flex-col items-center space-y-2"
                onClick={() => window.open('/master', '_blank')}
              >
                <FileText className="w-6 h-6" />
                <div className="text-center">
                  <div className="font-medium">Master Data</div>
                  <div className="text-xs text-muted-foreground">
                    Kelola data master
                  </div>
                </div>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}