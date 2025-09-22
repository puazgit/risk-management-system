"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { AssessmentForm } from "@/components/risks"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Loader2, BarChart3 } from "lucide-react"
import { toast } from "sonner"

interface AssessmentFormData {
  jenisRisiko: string
  sumberRisiko: string
  probabilitasInheren: number
  dampakInheren: number
  probabilitasResidual: number
  dampakResidual: number
  kontrolYangAda: string
  efektivitasKontrol: string
  rencanaRespon: string
  targetWaktu?: string
  penanggungJawab: string
  catatan?: string
}

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

export default function RiskAssessmentPage() {
  const router = useRouter()
  const params = useParams()
  const id = params?.id as string
  
  const [risk, setRisk] = useState<Risk | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

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
      toast.error('Gagal memuat data risiko')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (data: AssessmentFormData) => {
    try {
      setIsSubmitting(true)

      // Transform form data to API format - send both inherent and residual
      const inherentPayload = {
        type: "INHERENT" as const,
        dampakValue: data.dampakInheren * data.probabilitasInheren, // Calculate risk score
        dampakScale: data.dampakInheren,
        probValue: data.dampakInheren * data.probabilitasInheren, // Calculate risk score
        probScale: data.probabilitasInheren,
        penjelasanDampakKualitatif: data.catatan
      }

      const residualPayload = {
        type: "RESIDUAL" as const,
        dampakValue: data.dampakResidual * data.probabilitasResidual, // Calculate risk score
        dampakScale: data.dampakResidual,
        probValue: data.dampakResidual * data.probabilitasResidual, // Calculate risk score
        probScale: data.probabilitasResidual,
        targetResidual: data.rencanaRespon
      }

      // Send inherent assessment
      const inherentResponse = await fetch(`/api/risks/${id}/assessment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(inherentPayload),
      })

      if (!inherentResponse.ok) {
        const error = await inherentResponse.json()
        throw new Error(error.message || 'Failed to save inherent assessment')
      }

      // Send residual assessment
      const residualResponse = await fetch(`/api/risks/${id}/assessment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(residualPayload),
      })

      if (!residualResponse.ok) {
        const error = await residualResponse.json()
        throw new Error(error.message || 'Failed to save residual assessment')
      }

      toast.success('Assessment berhasil disimpan')
      router.push(`/risks/${id}`)
    } catch (error) {
      console.error('Error saving assessment:', error)
      toast.error(error instanceof Error ? error.message : 'Gagal menyimpan assessment')
    } finally {
      setIsSubmitting(false)
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
          <Card>
            <CardContent className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (!risk) {
    return (
      <div className="container mx-auto py-6">
        <div className="max-w-4xl mx-auto text-center">
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

  // Prepare initial data if assessment already exists
  const initialData: Partial<AssessmentFormData> = {
    jenisRisiko: risk.kategori.categoryBUMN,
    sumberRisiko: risk.deskripsi || "",
    probabilitasInheren: risk.risikoInheren?.probability || 1,
    dampakInheren: risk.risikoInheren?.impact || 1,
    probabilitasResidual: risk.risikoResidual?.probability || 1,
    dampakResidual: risk.risikoResidual?.impact || 1,
    kontrolYangAda: "",
    efektivitasKontrol: "CUKUP_EFEKTIF" as const,
    rencanaRespon: "MITIGASI" as const,
    penanggungJawab: risk.ownerUnit.name,
  }

  return (
    <div className="container mx-auto py-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
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
            <h1 className="text-3xl font-bold">Assessment Risiko</h1>
            <p className="text-muted-foreground">
              Penilaian untuk: {risk.namaRisiko}
            </p>
          </div>
        </div>

        {/* Risk Overview */}
        <Card>
          <CardHeader>
            <CardTitle>Informasi Risiko</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Nama Risiko</label>
                <p className="mt-1 font-medium">{risk.namaRisiko}</p>
                <p className="text-sm text-muted-foreground">{risk.riskNumber}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Kategori</label>
                <p className="mt-1">{risk.kategori.categoryBUMN}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Unit Pemilik</label>
                <p className="mt-1">{risk.ownerUnit.name}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Current Assessment Status */}
        {(risk.risikoInheren || risk.risikoResidual) && (
          <Card>
            <CardHeader>
              <CardTitle>Status Assessment Saat Ini</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <h4 className="font-medium">Risiko Inheren</h4>
                  {risk.risikoInheren ? (
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <Badge className={getRiskLevelColor(risk.risikoInheren.inherenLevel)}>
                          {getRiskLevelText(risk.risikoInheren.inherenLevel)}
                        </Badge>
                        <span className="text-sm">Skor: {risk.risikoInheren.inherenExposure}</span>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Probabilitas: {risk.risikoInheren.probability}/5 • 
                        Dampak: {risk.risikoInheren.impact}/5
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">Belum dinilai</p>
                  )}
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium">Risiko Residual</h4>
                  {risk.risikoResidual ? (
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <Badge className={getRiskLevelColor(risk.risikoResidual.residualLevel)}>
                          {getRiskLevelText(risk.risikoResidual.residualLevel)}
                        </Badge>
                        <span className="text-sm">Skor: {risk.risikoResidual.residualExposure}</span>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Probabilitas: {risk.risikoResidual.probability}/5 • 
                        Dampak: {risk.risikoResidual.impact}/5
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">Belum dinilai</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Assessment Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Form Assessment
            </CardTitle>
          </CardHeader>
          <CardContent>
            <AssessmentForm
              riskId={id}
              onSubmit={handleSubmit}
              isSubmitting={isSubmitting}
            />
          </CardContent>
        </Card>

        {/* Guidelines */}
        <Card>
          <CardHeader>
            <CardTitle>Panduan Assessment</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium mb-2">Skala Probabilitas</h4>
                <div className="text-sm space-y-1">
                  <div><strong>1 - Sangat Rendah:</strong> 0-5% kemungkinan terjadi</div>
                  <div><strong>2 - Rendah:</strong> 5-25% kemungkinan terjadi</div>
                  <div><strong>3 - Sedang:</strong> 25-50% kemungkinan terjadi</div>
                  <div><strong>4 - Tinggi:</strong> 50-75% kemungkinan terjadi</div>
                  <div><strong>5 - Sangat Tinggi:</strong> 75-100% kemungkinan terjadi</div>
                </div>
              </div>
              <div>
                <h4 className="font-medium mb-2">Skala Dampak</h4>
                <div className="text-sm space-y-1">
                  <div><strong>1 - Sangat Rendah:</strong> &lt; 1M dampak finansial</div>
                  <div><strong>2 - Rendah:</strong> 1M - 5M dampak finansial</div>
                  <div><strong>3 - Sedang:</strong> 5M - 25M dampak finansial</div>
                  <div><strong>4 - Tinggi:</strong> 25M - 100M dampak finansial</div>
                  <div><strong>5 - Sangat Tinggi:</strong> &gt; 100M dampak finansial</div>
                </div>
              </div>
            </div>
            
            <div className="border-t pt-4">
              <h4 className="font-medium mb-2">Strategi Respon Risiko</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <div><strong>Hindari:</strong> Menghindari aktivitas yang menimbulkan risiko</div>
                  <div><strong>Mitigasi:</strong> Mengurangi kemungkinan atau dampak risiko</div>
                </div>
                <div>
                  <div><strong>Transfer:</strong> Memindahkan risiko ke pihak lain</div>
                  <div><strong>Terima:</strong> Menerima risiko dengan pengawasan ketat</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}