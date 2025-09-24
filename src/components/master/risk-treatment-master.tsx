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
import { Plus, Pencil, Trash2, Target, Search, User, Calendar, DollarSign } from "lucide-react"

interface Risk {
  id: number
  namaRisiko: string
  riskNumber: string
}

interface User {
  id: number
  name: string
  email: string
  role: string
  unit: {
    id: number
    name: string
    code: string
  }
}

interface RiskTreatment {
  id: number
  riskId: number
  picId: number
  treatmentOption: string | null
  treatmentPlan: string
  output: string
  costRupiah: number | null
  timelineMonths: number | null
  rkapProgramType: string | null
  risiko: Risk
  pic: User
  realisasi: Array<{
    id: number
    status: string | null
    progress: string | null
    periode: string
  }>
  _count: {
    realisasi: number
  }
}

const TREATMENT_OPTIONS = [
  { value: "MITIGATE", label: "Mitigate (Kurangi)", color: "bg-blue-500" },
  { value: "ACCEPT", label: "Accept (Terima)", color: "bg-green-500" },
  { value: "AVOID", label: "Avoid (Hindari)", color: "bg-yellow-500" },
  { value: "TRANSFER", label: "Transfer (Pindahkan)", color: "bg-purple-500" },
]

const RKAP_PROGRAM_TYPES = [
  "Program Strategis",
  "Program Operasional", 
  "Program Investasi",
  "Program Pemeliharaan",
  "Program Pengembangan"
]

export function RiskTreatmentMaster() {
  const [treatments, setTreatments] = useState<RiskTreatment[]>([])
  const [risks, setRisks] = useState<Risk[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedRisk, setSelectedRisk] = useState<string>("all")
  const [selectedTreatment, setSelectedTreatment] = useState<string>("all")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingTreatment, setEditingTreatment] = useState<RiskTreatment | null>(null)
  const [formData, setFormData] = useState({
    riskId: "",
    picId: "",
    treatmentOption: "",
    treatmentPlan: "",
    output: "",
    costRupiah: "",
    timelineMonths: "",
    rkapProgramType: "",
  })

  // Fetch data
  useEffect(() => {
    fetchTreatments()
    fetchRisks()
    fetchUsers()
  }, [])

  const fetchTreatments = async () => {
    try {
      const response = await fetch("/api/master/risk-treatment")
      const data = await response.json()
      
      if (data.success) {
        setTreatments(data.data)
      } else {
        toast.error("Gagal memuat data risk treatment plans")
      }
    } catch (error) {
      console.error("Error fetching risk treatments:", error)
      toast.error("Gagal memuat data risk treatment plans")
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

  const fetchUsers = async () => {
    try {
      const response = await fetch("/api/users")
      const data = await response.json()
      
      if (data.success) {
        setUsers(data.data)
      }
    } catch (error) {
      console.error("Error fetching users:", error)
    }
  }

  const resetForm = () => {
    setFormData({
      riskId: "",
      picId: "",
      treatmentOption: "",
      treatmentPlan: "",
      output: "",
      costRupiah: "",
      timelineMonths: "",
      rkapProgramType: "",
    })
    setEditingTreatment(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const payload = {
        riskId: parseInt(formData.riskId),
        picId: parseInt(formData.picId),
        treatmentOption: formData.treatmentOption || null,
        treatmentPlan: formData.treatmentPlan,
        output: formData.output,
        costRupiah: formData.costRupiah ? parseFloat(formData.costRupiah) : null,
        timelineMonths: formData.timelineMonths ? parseInt(formData.timelineMonths) : null,
        rkapProgramType: formData.rkapProgramType || null,
      }

      const url = editingTreatment 
        ? `/api/master/risk-treatment/${editingTreatment.id}`
        : "/api/master/risk-treatment"
      
      const method = editingTreatment ? "PUT" : "POST"

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
        fetchTreatments()
        setIsDialogOpen(false)
        resetForm()
      } else {
        toast.error(data.error || "Terjadi kesalahan")
      }
    } catch (error) {
      console.error("Error saving risk treatment:", error)
      toast.error("Gagal menyimpan risk treatment plan")
    } finally {
      setSaving(false)
    }
  }

  const handleEdit = (treatment: RiskTreatment) => {
    setEditingTreatment(treatment)
    setFormData({
      riskId: treatment.riskId.toString(),
      picId: treatment.picId.toString(),
      treatmentOption: treatment.treatmentOption || "",
      treatmentPlan: treatment.treatmentPlan,
      output: treatment.output,
      costRupiah: treatment.costRupiah?.toString() || "",
      timelineMonths: treatment.timelineMonths?.toString() || "",
      rkapProgramType: treatment.rkapProgramType || "",
    })
    setIsDialogOpen(true)
  }

  const handleDelete = async (id: number) => {
    try {
      const response = await fetch(`/api/master/risk-treatment/${id}`, {
        method: "DELETE",
      })

      const data = await response.json()

      if (data.success) {
        toast.success(data.message)
        fetchTreatments()
      } else {
        toast.error(data.error || "Gagal menghapus risk treatment plan")
      }
    } catch (error) {
      console.error("Error deleting risk treatment:", error)
      toast.error("Gagal menghapus risk treatment plan")
    }
  }

  // Filter treatments
  const filteredTreatments = treatments.filter((treatment) => {
    const matchesSearch = 
      treatment.treatmentPlan.toLowerCase().includes(searchTerm.toLowerCase()) ||
      treatment.output.toLowerCase().includes(searchTerm.toLowerCase()) ||
      treatment.risiko.namaRisiko.toLowerCase().includes(searchTerm.toLowerCase()) ||
      treatment.risiko.riskNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      treatment.pic.name.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesRisk = selectedRisk === "all" || treatment.riskId.toString() === selectedRisk
    const matchesTreatment = selectedTreatment === "all" || treatment.treatmentOption === selectedTreatment

    return matchesSearch && matchesRisk && matchesTreatment
  })

  const getTreatmentBadge = (option: string | null) => {
    if (!option) return <Badge variant="outline">Tidak diset</Badge>

    const treatmentInfo = TREATMENT_OPTIONS.find(t => t.value === option)
    if (!treatmentInfo) return <Badge variant="outline">{option}</Badge>

    return (
      <Badge 
        className={`text-white ${treatmentInfo.color}`}
        variant="secondary"
      >
        {treatmentInfo.label}
      </Badge>
    )
  }

  const formatCurrency = (amount: number | null) => {
    if (!amount) return "Tidak diset"
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount)
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-muted-foreground">Memuat data risk treatment plans...</div>
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
            <Target className="h-5 w-5" />
            <span>Risk Treatment Plans Management</span>
          </CardTitle>
          <CardDescription>
            Kelola rencana perlakuan risiko dengan PIC assignment dan cost tracking
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
                  placeholder="Cari treatment plan..."
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
              <Select value={selectedTreatment} onValueChange={setSelectedTreatment}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Filter Treatment" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Treatment</SelectItem>
                  {TREATMENT_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => { resetForm(); setIsDialogOpen(true) }}>
                  <Plus className="h-4 w-4 mr-2" />
                  Tambah Treatment Plan
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[700px]">
                <form onSubmit={handleSubmit}>
                  <DialogHeader>
                    <DialogTitle>
                      {editingTreatment ? "Edit Risk Treatment Plan" : "Tambah Risk Treatment Plan"}
                    </DialogTitle>
                    <DialogDescription>
                      {editingTreatment 
                        ? "Perbarui informasi risk treatment plan yang dipilih" 
                        : "Buat risk treatment plan baru untuk mitigasi risiko"}
                    </DialogDescription>
                  </DialogHeader>
                  
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
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
                        <Label htmlFor="picId">PIC (Person In Charge) *</Label>
                        <Select 
                          value={formData.picId} 
                          onValueChange={(value) => setFormData(prev => ({ ...prev, picId: value }))}
                          required
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Pilih PIC" />
                          </SelectTrigger>
                          <SelectContent>
                            {users.map((user) => (
                              <SelectItem key={user.id} value={user.id.toString()}>
                                {user.name} - {user.unit.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="treatmentOption">Opsi Perlakuan</Label>
                      <Select 
                        value={formData.treatmentOption} 
                        onValueChange={(value) => setFormData(prev => ({ ...prev, treatmentOption: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih opsi perlakuan" />
                        </SelectTrigger>
                        <SelectContent>
                          {TREATMENT_OPTIONS.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="treatmentPlan">Rencana Perlakuan *</Label>
                      <Textarea
                        id="treatmentPlan"
                        value={formData.treatmentPlan}
                        onChange={(e) => setFormData(prev => ({ ...prev, treatmentPlan: e.target.value }))}
                        placeholder="Jelaskan rencana perlakuan risiko secara detail..."
                        rows={3}
                        required
                      />
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="output">Output *</Label>
                      <Textarea
                        id="output"
                        value={formData.output}
                        onChange={(e) => setFormData(prev => ({ ...prev, output: e.target.value }))}
                        placeholder="Jelaskan output yang diharapkan dari perlakuan ini..."
                        rows={2}
                        required
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="costRupiah">Biaya (Rupiah)</Label>
                        <Input
                          id="costRupiah"
                          type="number"
                          step="1000"
                          value={formData.costRupiah}
                          onChange={(e) => setFormData(prev => ({ ...prev, costRupiah: e.target.value }))}
                          placeholder="0"
                        />
                      </div>

                      <div className="grid gap-2">
                        <Label htmlFor="timelineMonths">Timeline (Bulan)</Label>
                        <Input
                          id="timelineMonths"
                          type="number"
                          min="1"
                          value={formData.timelineMonths}
                          onChange={(e) => setFormData(prev => ({ ...prev, timelineMonths: e.target.value }))}
                          placeholder="0"
                        />
                      </div>

                      <div className="grid gap-2">
                        <Label htmlFor="rkapProgramType">Jenis Program RKAP</Label>
                        <Select 
                          value={formData.rkapProgramType} 
                          onValueChange={(value) => setFormData(prev => ({ ...prev, rkapProgramType: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Pilih jenis program" />
                          </SelectTrigger>
                          <SelectContent>
                            {RKAP_PROGRAM_TYPES.map((type) => (
                              <SelectItem key={type} value={type}>
                                {type}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
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
                      {saving ? "Menyimpan..." : editingTreatment ? "Perbarui" : "Simpan"}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>

      {/* Treatment Plans Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            Daftar Risk Treatment Plans ({filteredTreatments.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredTreatments.length === 0 ? (
            <div className="text-center py-12">
              <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-muted-foreground mb-2">
                Belum ada risk treatment plans
              </h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm || selectedRisk !== "all" || selectedTreatment !== "all"
                  ? "Tidak ada treatment plan yang sesuai dengan filter" 
                  : "Mulai dengan menambahkan risk treatment plan pertama"}
              </p>
              {!searchTerm && selectedRisk === "all" && selectedTreatment === "all" && (
                <Button onClick={() => { resetForm(); setIsDialogOpen(true) }}>
                  <Plus className="h-4 w-4 mr-2" />
                  Tambah Treatment Plan Pertama
                </Button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[80px]">No.</TableHead>
                    <TableHead>Risiko</TableHead>
                    <TableHead>Opsi Treatment</TableHead>
                    <TableHead>PIC</TableHead>
                    <TableHead>Rencana</TableHead>
                    <TableHead>Biaya</TableHead>
                    <TableHead>Timeline</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTreatments.map((treatment, index) => (
                    <TableRow key={treatment.id}>
                      <TableCell className="font-medium">
                        {index + 1}
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{treatment.risiko.riskNumber}</div>
                          <div className="text-sm text-muted-foreground truncate max-w-[200px]">
                            {treatment.risiko.namaRisiko}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {getTreatmentBadge(treatment.treatmentOption)}
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{treatment.pic.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {treatment.pic.unit?.name || 'Unit tidak tersedia'}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="max-w-[300px] truncate">
                          {treatment.treatmentPlan}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-1">
                          <DollarSign className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">
                            {formatCurrency(treatment.costRupiah)}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">
                            {treatment.timelineMonths ? `${treatment.timelineMonths} bulan` : "Tidak diset"}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(treatment)}
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
                                <AlertDialogTitle>Hapus Risk Treatment Plan</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Apakah Anda yakin ingin menghapus risk treatment plan untuk risiko "{treatment.risiko.namaRisiko}"? 
                                  Tindakan ini tidak dapat dibatalkan.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Batal</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDelete(treatment.id)}
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