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
import { Plus, Pencil, Trash2, Shield, Search, AlertCircle } from "lucide-react"

interface Risk {
  id: number
  namaRisiko: string
  riskNumber: string
}

interface KontrolExisting {
  id: number
  riskId: number
  controlType: string | null
  deskripsiDampak: string | null
  effectivenessRating: string | null
  risiko: Risk
}

const EFFECTIVENESS_RATINGS = [
  { value: "SANGAT_EFEKTIF", label: "Sangat Efektif", color: "bg-green-500" },
  { value: "EFEKTIF", label: "Efektif", color: "bg-blue-500" },
  { value: "CUKUP_EFEKTIF", label: "Cukup Efektif", color: "bg-yellow-500" },
  { value: "KURANG_EFEKTIF", label: "Kurang Efektif", color: "bg-orange-500" },
  { value: "TIDAK_EFEKTIF", label: "Tidak Efektif", color: "bg-red-500" },
]

const CONTROL_TYPES = [
  "Preventive Control",
  "Detective Control", 
  "Corrective Control",
  "Directive Control",
  "Compensating Control"
]

export function KontrolExistingMaster() {
  const [kontrols, setKontrols] = useState<KontrolExisting[]>([])
  const [risks, setRisks] = useState<Risk[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedRisk, setSelectedRisk] = useState<string>("all")
  const [selectedEffectiveness, setSelectedEffectiveness] = useState<string>("all")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingKontrol, setEditingKontrol] = useState<KontrolExisting | null>(null)
  const [formData, setFormData] = useState({
    riskId: "",
    controlType: "",
    deskripsiDampak: "",
    effectivenessRating: "",
  })

  // Fetch Kontrol Existing and Risks
  useEffect(() => {
    fetchKontrols()
    fetchRisks()
  }, [])

  const fetchKontrols = async () => {
    try {
      const response = await fetch("/api/master/kontrol-existing")
      const data = await response.json()
      
      if (data.success) {
        setKontrols(data.data)
      } else {
        toast.error("Gagal memuat data kontrol existing")
      }
    } catch (error) {
      console.error("Error fetching kontrol existing:", error)
      toast.error("Gagal memuat data kontrol existing")
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
      controlType: "",
      deskripsiDampak: "",
      effectivenessRating: "",
    })
    setEditingKontrol(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const payload = {
        riskId: parseInt(formData.riskId),
        controlType: formData.controlType,
        deskripsiDampak: formData.deskripsiDampak || null,
        effectivenessRating: formData.effectivenessRating,
      }

      const url = editingKontrol 
        ? `/api/master/kontrol-existing/${editingKontrol.id}`
        : "/api/master/kontrol-existing"
      
      const method = editingKontrol ? "PUT" : "POST"

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
        fetchKontrols()
        setIsDialogOpen(false)
        resetForm()
      } else {
        toast.error(data.error || "Terjadi kesalahan")
      }
    } catch (error) {
      console.error("Error saving kontrol existing:", error)
      toast.error("Gagal menyimpan kontrol existing")
    } finally {
      setSaving(false)
    }
  }

  const handleEdit = (kontrol: KontrolExisting) => {
    setEditingKontrol(kontrol)
    setFormData({
      riskId: kontrol.riskId.toString(),
      controlType: kontrol.controlType || "",
      deskripsiDampak: kontrol.deskripsiDampak || "",
      effectivenessRating: kontrol.effectivenessRating || "",
    })
    setIsDialogOpen(true)
  }

  const handleDelete = async (id: number) => {
    try {
      const response = await fetch(`/api/master/kontrol-existing/${id}`, {
        method: "DELETE",
      })

      const data = await response.json()

      if (data.success) {
        toast.success(data.message)
        fetchKontrols()
      } else {
        toast.error(data.error || "Gagal menghapus kontrol existing")
      }
    } catch (error) {
      console.error("Error deleting kontrol existing:", error)
      toast.error("Gagal menghapus kontrol existing")
    }
  }

  // Filter controls
  const filteredKontrols = kontrols.filter((kontrol) => {
    const matchesSearch = 
      kontrol.controlType?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      kontrol.deskripsiDampak?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      kontrol.risiko.namaRisiko.toLowerCase().includes(searchTerm.toLowerCase()) ||
      kontrol.risiko.riskNumber.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesRisk = selectedRisk === "all" || kontrol.riskId.toString() === selectedRisk
    const matchesEffectiveness = selectedEffectiveness === "all" || kontrol.effectivenessRating === selectedEffectiveness

    return matchesSearch && matchesRisk && matchesEffectiveness
  })

  const getEffectivenessBadge = (rating: string | null) => {
    if (!rating) return <Badge variant="outline">Belum dinilai</Badge>

    const ratingInfo = EFFECTIVENESS_RATINGS.find(r => r.value === rating)
    if (!ratingInfo) return <Badge variant="outline">{rating}</Badge>

    return (
      <Badge 
        className={`text-white ${ratingInfo.color}`}
        variant="secondary"
      >
        {ratingInfo.label}
      </Badge>
    )
  }

  const getControlTypeBadge = (type: string | null) => {
    if (!type) return <Badge variant="outline">Tidak diset</Badge>
    
    const color = type.includes("Preventive") ? "bg-green-100 text-green-800" :
                  type.includes("Detective") ? "bg-blue-100 text-blue-800" :
                  type.includes("Corrective") ? "bg-orange-100 text-orange-800" :
                  type.includes("Directive") ? "bg-purple-100 text-purple-800" :
                  "bg-gray-100 text-gray-800"

    return (
      <Badge className={color} variant="outline">
        {type}
      </Badge>
    )
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-muted-foreground">Memuat data kontrol existing...</div>
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
            <Shield className="h-5 w-5" />
            <span>Kontrol Existing Management</span>
          </CardTitle>
          <CardDescription>
            Kelola dan evaluasi efektivitas kontrol yang sudah ada untuk mitigasi risiko
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Actions and Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-4 flex-1">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Cari kontrol atau risiko..."
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
              <Select value={selectedEffectiveness} onValueChange={setSelectedEffectiveness}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Filter Efektivitas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Efektivitas</SelectItem>
                  {EFFECTIVENESS_RATINGS.map((rating) => (
                    <SelectItem key={rating.value} value={rating.value}>
                      {rating.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => { resetForm(); setIsDialogOpen(true) }}>
                  <Plus className="h-4 w-4 mr-2" />
                  Tambah Kontrol
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px]">
                <form onSubmit={handleSubmit}>
                  <DialogHeader>
                    <DialogTitle>
                      {editingKontrol ? "Edit Kontrol Existing" : "Tambah Kontrol Existing"}
                    </DialogTitle>
                    <DialogDescription>
                      {editingKontrol 
                        ? "Perbarui informasi kontrol existing yang dipilih" 
                        : "Tambahkan kontrol existing baru untuk mitigasi risiko"}
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
                      <Label htmlFor="controlType">Jenis Kontrol *</Label>
                      <Select 
                        value={formData.controlType} 
                        onValueChange={(value) => setFormData(prev => ({ ...prev, controlType: value }))}
                        required
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih jenis kontrol" />
                        </SelectTrigger>
                        <SelectContent>
                          {CONTROL_TYPES.map((type) => (
                            <SelectItem key={type} value={type}>
                              {type}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="effectivenessRating">Rating Efektivitas *</Label>
                      <Select 
                        value={formData.effectivenessRating} 
                        onValueChange={(value) => setFormData(prev => ({ ...prev, effectivenessRating: value }))}
                        required
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih rating efektivitas" />
                        </SelectTrigger>
                        <SelectContent>
                          {EFFECTIVENESS_RATINGS.map((rating) => (
                            <SelectItem key={rating.value} value={rating.value}>
                              {rating.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="deskripsiDampak">Deskripsi Dampak</Label>
                      <Textarea
                        id="deskripsiDampak"
                        value={formData.deskripsiDampak}
                        onChange={(e) => setFormData(prev => ({ ...prev, deskripsiDampak: e.target.value }))}
                        placeholder="Jelaskan dampak dari kontrol ini terhadap risiko..."
                        rows={3}
                      />
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
                      {saving ? "Menyimpan..." : editingKontrol ? "Perbarui" : "Simpan"}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>

      {/* Kontrol Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            Daftar Kontrol Existing ({filteredKontrols.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredKontrols.length === 0 ? (
            <div className="text-center py-12">
              <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-muted-foreground mb-2">
                Belum ada kontrol existing
              </h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm || selectedRisk !== "all" || selectedEffectiveness !== "all"
                  ? "Tidak ada kontrol yang sesuai dengan filter" 
                  : "Mulai dengan menambahkan kontrol existing pertama"}
              </p>
              {!searchTerm && selectedRisk === "all" && selectedEffectiveness === "all" && (
                <Button onClick={() => { resetForm(); setIsDialogOpen(true) }}>
                  <Plus className="h-4 w-4 mr-2" />
                  Tambah Kontrol Pertama
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
                    <TableHead>Jenis Kontrol</TableHead>
                    <TableHead>Efektivitas</TableHead>
                    <TableHead>Deskripsi Dampak</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredKontrols.map((kontrol, index) => (
                    <TableRow key={kontrol.id}>
                      <TableCell className="font-medium">
                        {index + 1}
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{kontrol.risiko.riskNumber}</div>
                          <div className="text-sm text-muted-foreground truncate max-w-[200px]">
                            {kontrol.risiko.namaRisiko}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {getControlTypeBadge(kontrol.controlType)}
                      </TableCell>
                      <TableCell>
                        {getEffectivenessBadge(kontrol.effectivenessRating)}
                      </TableCell>
                      <TableCell>
                        <div className="max-w-[300px] truncate">
                          {kontrol.deskripsiDampak || (
                            <span className="text-muted-foreground text-sm">Tidak ada deskripsi</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(kontrol)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="outline" size="sm">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Hapus Kontrol Existing</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Apakah Anda yakin ingin menghapus kontrol "{kontrol.controlType}"? 
                                  Tindakan ini tidak dapat dibatalkan.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Batal</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDelete(kontrol.id)}
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