"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { RiskForm } from "@/components/risks"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
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

export default function CreateRiskPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [sasaranOptions, setSasaranOptions] = useState<DropdownOption[]>([])
  const [unitOptions, setUnitOptions] = useState<DropdownOption[]>([])
  const [kategoriOptions, setKategoriOptions] = useState<DropdownOption[]>([])

  useEffect(() => {
    loadDropdownData()
  }, [])

  const loadDropdownData = async () => {
    try {
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
      console.error("Error loading dropdown data:", error)
      toast.error("Gagal memuat data dropdown")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (data: RiskFormData) => {
    try {
      setIsSubmitting(true)

      const response = await fetch("/api/risks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || "Failed to create risk")
      }

      const result = await response.json()
      toast.success("Risiko berhasil dibuat")
      router.push(`/risks/${result.id}`)
    } catch (error) {
      console.error("Error creating risk:", error)
      toast.error(error instanceof Error ? error.message : "Gagal membuat risiko")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="container mx-auto py-6">
      <div className="max-w-4xl mx-auto space-y-6">
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
            <h1 className="text-3xl font-bold">Tambah Risiko Baru</h1>
            <p className="text-muted-foreground">
              Identifikasi dan penilaian risiko baru dalam organisasi
            </p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Form Identifikasi Risiko</CardTitle>
          </CardHeader>
          <CardContent>
            <RiskForm
              sasaranOptions={sasaranOptions}
              unitOptions={unitOptions}
              kategoriOptions={kategoriOptions}
              isLoading={isLoading}
              onSubmit={handleSubmit}
              submitLabel="Buat Risiko"
              mode="create"
            />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
