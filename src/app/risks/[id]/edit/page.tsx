"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { RiskForm } from "@/components/risks"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Loader2 } from "lucide-react"
import { toast } from "sonner"

interface RiskFormData {
  sasaranId: number
  ownerUnitId: number
  kategoriId: number
  namaRisiko: string
  deskripsi?: string
  riskNumber?: string
}

interface DropdownOption {
  value: number
  label: string
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
  sasaran: {
    id: number
    name: string
  }
}

export default function EditRiskPage() {
  const router = useRouter()
  const params = useParams()
  const id = params?.id as string
  
  const [risk, setRisk] = useState<Risk | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [sasaranOptions, setSasaranOptions] = useState<DropdownOption[]>([])
  const [unitOptions, setUnitOptions] = useState<DropdownOption[]>([])
  const [kategoriOptions, setKategoriOptions] = useState<DropdownOption[]>([])

  useEffect(() => {
    if (id) {
      loadData()
    }
  }, [id])

  const loadData = async () => {
    try {
      setIsLoading(true)
      
      // Load risk data and dropdown options in parallel
      const [riskResponse] = await Promise.all([
        fetch(`/api/risks/${id}`),
      ])
      
      if (!riskResponse.ok) {
        throw new Error('Failed to fetch risk')
      }
      
      const riskData = await riskResponse.json()
      setRisk(riskData)

      // Load dropdown data (mock data for now)
      setSasaranOptions([
        { value: 1, label: "Meningkatkan Profitabilitas" },
        { value: 2, label: "Optimalisasi Operasional" },
        { value: 3, label: "Transformasi Digital" },
        { value: 4, label: "Sustainable Growth" },
      ])

      setUnitOptions([
        { value: 1, label: "Divisi Keuangan" },
        { value: 2, label: "Divisi Operasional" },
        { value: 3, label: "Divisi IT" },
        { value: 4, label: "Divisi SDM" },
        { value: 5, label: "Divisi Pemasaran" },
      ])

      setKategoriOptions([
        { value: 1, label: "Risiko Operasional" },
        { value: 2, label: "Risiko Finansial" },
        { value: 3, label: "Risiko Strategis" },
        { value: 4, label: "Risiko Kepatuhan" },
        { value: 5, label: "Risiko Reputasi" },
      ])
    } catch (error) {
      console.error('Error loading data:', error)
      toast.error('Gagal memuat data risiko')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (data: RiskFormData) => {
    try {
      setIsSubmitting(true)

      const response = await fetch(`/api/risks/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to update risk')
      }

      toast.success('Risiko berhasil diperbarui')
      router.push(`/risks/${id}`)
    } catch (error) {
      console.error('Error updating risk:', error)
      toast.error(error instanceof Error ? error.message : 'Gagal memperbarui risiko')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => {
    router.push(`/risks/${id}`)
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
            <CardHeader>
              <div className="h-6 w-32 bg-gray-200 rounded animate-pulse"></div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
              </div>
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

  // Prepare initial data for the form
  const initialData: Partial<RiskFormData> = {
    sasaranId: risk.sasaran.id,
    ownerUnitId: risk.ownerUnit.id,
    kategoriId: risk.kategori.id,
    namaRisiko: risk.namaRisiko,
    deskripsi: risk.deskripsi || "",
    riskNumber: risk.riskNumber,
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
            <h1 className="text-3xl font-bold">Edit Risiko</h1>
            <p className="text-muted-foreground">
              Perbarui informasi risiko: {risk.namaRisiko}
            </p>
          </div>
        </div>

        {/* Form Card */}
        <Card>
          <CardHeader>
            <CardTitle>Form Edit Risiko</CardTitle>
          </CardHeader>
          <CardContent>
            <RiskForm
              initialData={initialData}
              sasaranOptions={sasaranOptions}
              unitOptions={unitOptions}
              kategoriOptions={kategoriOptions}
              isLoading={isSubmitting}
              onSubmit={handleSubmit}
              onCancel={handleCancel}
              submitLabel="Perbarui Risiko"
              mode="edit"
            />
          </CardContent>
        </Card>

        {/* Guidelines Card */}
        <Card>
          <CardHeader>
            <CardTitle>Panduan Edit</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium mb-2">Perubahan Data</h4>
                <div className="text-sm space-y-1">
                  <div><strong>Pastikan:</strong> Semua perubahan sudah sesuai</div>
                  <div><strong>Validasi:</strong> Data yang diisi sudah benar</div>
                  <div><strong>Konsistensi:</strong> Informasi tetap akurat</div>
                </div>
              </div>
              <div>
                <h4 className="font-medium mb-2">Dampak Perubahan</h4>
                <div className="text-sm space-y-1">
                  <div><strong>Penilaian:</strong> Mungkin perlu assessment ulang</div>
                  <div><strong>Laporan:</strong> Data akan ter-update di laporan</div>
                  <div><strong>Tracking:</strong> Perubahan akan tercatat</div>
                </div>
              </div>
            </div>
            
            <div className="border-t pt-4">
              <h4 className="font-medium mb-2">Setelah Edit</h4>
              <div className="text-sm">
                <div>• Risiko akan otomatis tersimpan dengan versi terbaru</div>
                <div>• Pastikan melakukan review assessment jika diperlukan</div>
                <div>• Update strategi penanganan sesuai perubahan</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}