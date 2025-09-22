"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"
import { Plus, Pencil, Trash2, AlertTriangle, Activity, Search } from "lucide-react"

interface Risk {
  id: number
  namaRisiko: string
  riskNumber: string
}

interface KRI {
  id: number
  riskId: number
  indicatorName: string
  unitSatuan: string
  thresholdCategory: string | null
  thresholdValue: number | null
  risiko: Risk
}

export function KRIMaster() {
  const [kris, setKris] = useState<KRI[]>([])
  const [risks, setRisks] = useState<Risk[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedRisk, setSelectedRisk] = useState<string>("all")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingKRI, setEditingKRI] = useState<KRI | null>(null)
  const [formData, setFormData] = useState({
    riskId: "",
    indicatorName: "",
    unitSatuan: "",
    thresholdCategory: "",
    thresholdValue: "",
  })

  // Fetch KRIs and Risks
  useEffect(() => {
    fetchKRIs()
    fetchRisks()
  }, [])

  const fetchKRIs = async () => {
    try {
      const response = await fetch("/api/master/kri")
      const data = await response.json()
      
      if (data.success) {
        setKris(data.data)
      } else {
        toast.error("Gagal memuat data KRI")
      }
    } catch (error) {
      console.error("Error fetching KRIs:", error)
      toast.error("Gagal memuat data KRI")
    } finally {
      setLoading(false)
    }
  }

  const fetchRisks = async () => {
    try {
      const response = await fetch("/api/risks")
      const data = await response.json()
      
      if (data.success) {
        setRisks(data.data)
      }
    } catch (error) {
      console.error("Error fetching risks:", error)
    }
  }

  const resetForm = () => {
    setFormData({
      riskId: "",
      indicatorName: "",
      unitSatuan: "",
      thresholdCategory: "",
      thresholdValue: "",
    })
    setEditingKRI(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const payload = {
        riskId: parseInt(formData.riskId),
        indicatorName: formData.indicatorName,
        unitSatuan: formData.unitSatuan,
        thresholdCategory: formData.thresholdCategory || null,
        thresholdValue: formData.thresholdValue ? parseFloat(formData.thresholdValue) : null,
      }

      const url = editingKRI 
        ? `/api/master/kri/${editingKRI.id}`
        : "/api/master/kri"
      
      const method = editingKRI ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })

      const data = await response.json()

      if (data.success) {
        toast.success(data.message)
        fetchKRIs()
        setIsDialogOpen(false)
        resetForm()
      } else {
        toast.error(data.error || "Terjadi kesalahan")
      }
    } catch (error) {
      console.error("Error saving KRI:", error)
      toast.error("Gagal menyimpan KRI")
    } finally {
      setSaving(false)
    }
  }

  const handleEdit = (kri: KRI) => {
    setEditingKRI(kri)
    setFormData({
      riskId: kri.riskId.toString(),
      indicatorName: kri.indicatorName,
      unitSatuan: kri.unitSatuan,
      thresholdCategory: kri.thresholdCategory || "",
      thresholdValue: kri.thresholdValue?.toString() || "",
    })
    setIsDialogOpen(true)
  }

  const handleDelete = async (id: number) => {
    try {
      const response = await fetch(`/api/master/kri/${id}`, {
        method: "DELETE",
      })

      const data = await response.json()

      if (data.success) {
        toast.success(data.message)
        fetchKRIs()
      } else {
        toast.error(data.error || "Gagal menghapus KRI")
      }
    } catch (error) {
      console.error("Error deleting KRI:", error)
      toast.error("Gagal menghapus KRI")
    }
  }

  // Filter KRIs
  const filteredKRIs = kris.filter((kri) => {
    const matchesSearch = 
      kri.indicatorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      kri.risiko.namaRisiko.toLowerCase().includes(searchTerm.toLowerCase()) ||
      kri.risiko.riskNumber.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesRisk = selectedRisk === "all" || kri.riskId.toString() === selectedRisk

    return matchesSearch && matchesRisk
  })

  const getThresholdBadge = (category: string | null, value: number | null) => {
    if (!category || value === null) return null

    const color = category === "RED" ? "destructive" : 
                  category === "YELLOW" ? "default" : "secondary"

    return (
      <Badge variant={color} className="text-xs">
        {category}: {value}
      </Badge>
    )
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-muted-foreground">Memuat data KRI...</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Activity className="w-5 h-5" />
            <span>KRI (Key Risk Indicators) Management</span>
          </CardTitle>
          <CardDescription>
            Kelola indikator kunci risiko untuk monitoring dan alert sistem
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Actions and Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
            <div className="flex flex-col flex-1 gap-4 sm:flex-row">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute w-4 h-4 transform -translate-y-1/2 left-3 top-1/2 text-muted-foreground" />
                <Input
                  placeholder="Cari KRI atau risiko..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select value={selectedRisk} onValueChange={setSelectedRisk}>
                <SelectTrigger className="w-full sm:w-[200px]">
                  <SelectValue placeholder="Filter Risiko" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Risiko</SelectItem>
                  {risks.map((risk) => (
                    <SelectItem key={risk.id} value={risk.id.toString()}>
                      {risk.riskNumber} - {risk.namaRisiko}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => { resetForm(); setIsDialogOpen(true) }}>
                  <Plus className="w-4 h-4 mr-2" />
                  Tambah KRI
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px]">
                <form onSubmit={handleSubmit}>
                  <DialogHeader>
                    <DialogTitle>
                      {editingKRI ? "Edit KRI" : "Tambah KRI Baru"}
                    </DialogTitle>
                    <DialogDescription>
                      {editingKRI 
                        ? "Perbarui informasi KRI yang dipilih" 
                        : "Buat KRI baru untuk monitoring risiko"}
                    </DialogDescription>
                  </DialogHeader>
                  
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="riskId">Risiko *</Label>
                      <Select 
                        value={formData.riskId} 
                        onValueChange={(value) => setFormData(prev => ({ ...prev, riskId: value }))}
                        required
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih risiko" />
                        </SelectTrigger>
                        <SelectContent>
                          {risks.map((risk) => (
                            <SelectItem key={risk.id} value={risk.id.toString()}>
                              {risk.riskNumber} - {risk.namaRisiko}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="indicatorName">Nama Indikator *</Label>
                      <Input
                        id="indicatorName"
                        value={formData.indicatorName}
                        onChange={(e) => setFormData(prev => ({ ...prev, indicatorName: e.target.value }))}
                        placeholder="Contoh: Jumlah Incident per Bulan"
                        required
                      />
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="unitSatuan">Unit/Satuan *</Label>
                      <Input
                        id="unitSatuan"
                        value={formData.unitSatuan}
                        onChange={(e) => setFormData(prev => ({ ...prev, unitSatuan: e.target.value }))}
                        placeholder="Contoh: Kasus, %, Jam, dll"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="thresholdCategory">Kategori Threshold</Label>
                        <Select 
                          value={formData.thresholdCategory} 
                          onValueChange={(value) => setFormData(prev => ({ ...prev, thresholdCategory: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Pilih kategori" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="GREEN">GREEN (Normal)</SelectItem>
                            <SelectItem value="YELLOW">YELLOW (Warning)</SelectItem>
                            <SelectItem value="RED">RED (Critical)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="grid gap-2">
                        <Label htmlFor="thresholdValue">Nilai Threshold</Label>
                        <Input
                          id="thresholdValue"
                          type="number"
                          step="0.01"
                          value={formData.thresholdValue}
                          onChange={(e) => setFormData(prev => ({ ...prev, thresholdValue: e.target.value }))}
                          placeholder="0.00"
                        />
                      </div>
                    </div>
                  </div>

                  <DialogFooter>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsDialogOpen(false)}
                      disabled={saving}
                    >
                      Batal
                    </Button>
                    <Button type="submit" disabled={saving}>
                      {saving ? "Menyimpan..." : editingKRI ? "Perbarui" : "Simpan"}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>

      {/* KRI Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            Daftar KRI ({filteredKRIs.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredKRIs.length === 0 ? (
            <div className="py-12 text-center">
              <Activity className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="mb-2 text-lg font-medium text-muted-foreground">
                Belum ada KRI
              </h3>
              <p className="mb-4 text-muted-foreground">
                {searchTerm || selectedRisk !== "all" 
                  ? "Tidak ada KRI yang sesuai dengan filter" 
                  : "Mulai dengan menambahkan KRI pertama"}
              </p>
              {!searchTerm && selectedRisk === "all" && (
                <Button onClick={() => { resetForm(); setIsDialogOpen(true) }}>
                  <Plus className="w-4 h-4 mr-2" />
                  Tambah KRI Pertama
                </Button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[100px]">No.</TableHead>
                    <TableHead>Risiko</TableHead>
                    <TableHead>Nama Indikator</TableHead>
                    <TableHead>Unit/Satuan</TableHead>
                    <TableHead>Threshold</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredKRIs.map((kri, index) => (
                    <TableRow key={kri.id}>
                      <TableCell className="font-medium">
                        {index + 1}
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{kri.risiko.riskNumber}</div>
                          <div className="text-sm text-muted-foreground truncate max-w-[200px]">
                            {kri.risiko.namaRisiko}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{kri.indicatorName}</div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{kri.unitSatuan}</Badge>
                      </TableCell>
                      <TableCell>
                        {getThresholdBadge(kri.thresholdCategory, kri.thresholdValue) || (
                          <span className="text-sm text-muted-foreground">Tidak diset</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(kri)}
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="outline" size="sm">
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Hapus KRI</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Apakah Anda yakin ingin menghapus KRI "{kri.indicatorName}"? 
                                  Tindakan ini tidak dapat dibatalkan.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Batal</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDelete(kri.id)}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  Hapus
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}