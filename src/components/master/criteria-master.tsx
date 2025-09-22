"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Edit, Trash2, Loader2 } from "lucide-react"
import { toast } from "sonner"

interface CriteriaItem {
  id: number
  type: string
  scale: string
  value: number
  description: string | null
}

interface FormData {
  type: string
  scale: string
  value: number
  description: string
}

export function CriteriaMaster() {
  const [criteria, setCriteria] = useState<CriteriaItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<CriteriaItem | null>(null)
  const [formData, setFormData] = useState<FormData>({
    type: "",
    scale: "",
    value: 1,
    description: ""
  })

  useEffect(() => {
    loadCriteria()
  }, [])

  const loadCriteria = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/master/criteria')
      
      if (!response.ok) {
        throw new Error('Failed to fetch criteria')
      }
      
      const result = await response.json()
      setCriteria(result.data)
    } catch (error) {
      console.error('Error loading criteria:', error)
      toast.error('Gagal memuat data kriteria')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.type || !formData.scale || !formData.value) {
      toast.error('Silakan lengkapi semua field yang wajib')
      return
    }

    try {
      setIsSubmitting(true)
      
      const url = editingItem 
        ? `/api/master/criteria/${editingItem.id}`
        : '/api/master/criteria'
      
      const method = editingItem ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to save criteria')
      }

      toast.success(editingItem ? 'Kriteria berhasil diupdate' : 'Kriteria berhasil ditambahkan')
      setIsDialogOpen(false)
      resetForm()
      loadCriteria()
    } catch (error) {
      console.error('Error saving criteria:', error)
      toast.error(error instanceof Error ? error.message : 'Gagal menyimpan kriteria')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEdit = (item: CriteriaItem) => {
    setEditingItem(item)
    setFormData({
      type: item.type,
      scale: item.scale,
      value: item.value,
      description: item.description || ""
    })
    setIsDialogOpen(true)
  }

  const handleDelete = async (item: CriteriaItem) => {
    if (!confirm('Apakah Anda yakin ingin menghapus kriteria ini?')) {
      return
    }

    try {
      const response = await fetch(`/api/master/criteria/${item.id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to delete criteria')
      }

      toast.success('Kriteria berhasil dihapus')
      loadCriteria()
    } catch (error) {
      console.error('Error deleting criteria:', error)
      toast.error(error instanceof Error ? error.message : 'Gagal menghapus kriteria')
    }
  }

  const resetForm = () => {
    setFormData({
      type: "",
      scale: "",
      value: 1,
      description: ""
    })
    setEditingItem(null)
  }

  const handleDialogOpenChange = (open: boolean) => {
    setIsDialogOpen(open)
    if (!open) {
      resetForm()
    }
  }

  const getTypeLabel = (type: string) => {
    return type === "DAMPAK" ? "Dampak" : "Probabilitas"
  }

  const getValueColor = (value: number) => {
    switch (value) {
      case 1: return "bg-green-100 text-green-800"
      case 2: return "bg-blue-100 text-blue-800" 
      case 3: return "bg-yellow-100 text-yellow-800"
      case 4: return "bg-orange-100 text-orange-800"
      case 5: return "bg-red-100 text-red-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  // Group criteria by type
  const dampakCriteria = criteria.filter(c => c.type === "DAMPAK").sort((a, b) => a.value - b.value)
  const probabilitasCriteria = criteria.filter(c => c.type === "PROBABILITAS").sort((a, b) => a.value - b.value)

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Kriteria Risiko</CardTitle>
              <CardDescription>
                Kelola kriteria dampak dan probabilitas untuk penilaian risiko
              </CardDescription>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={handleDialogOpenChange}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Tambah Kriteria
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[525px]">
                <form onSubmit={handleSubmit}>
                  <DialogHeader>
                    <DialogTitle>
                      {editingItem ? 'Edit Kriteria' : 'Tambah Kriteria Baru'}
                    </DialogTitle>
                    <DialogDescription>
                      {editingItem 
                        ? 'Ubah data kriteria risiko' 
                        : 'Tambahkan kriteria dampak atau probabilitas baru'
                      }
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="type">Tipe Kriteria *</Label>
                      <Select 
                        value={formData.type} 
                        onValueChange={(value) => setFormData({...formData, type: value})}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih tipe kriteria" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="DAMPAK">Dampak</SelectItem>
                          <SelectItem value="PROBABILITAS">Probabilitas</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="value">Nilai Skala (1-5) *</Label>
                      <Select 
                        value={formData.value.toString()} 
                        onValueChange={(value) => setFormData({...formData, value: parseInt(value)})}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih nilai skala" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">1 - Sangat Rendah</SelectItem>
                          <SelectItem value="2">2 - Rendah</SelectItem>
                          <SelectItem value="3">3 - Sedang</SelectItem>
                          <SelectItem value="4">4 - Tinggi</SelectItem>
                          <SelectItem value="5">5 - Sangat Tinggi</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="scale">Label Skala *</Label>
                      <Input
                        id="scale"
                        value={formData.scale}
                        onChange={(e) => setFormData({...formData, scale: e.target.value})}
                        placeholder="Contoh: Sangat Rendah, Hampir Pasti Terjadi"
                        required
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="description">Deskripsi</Label>
                      <Textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) => setFormData({...formData, description: e.target.value})}
                        placeholder="Deskripsi kriteria..."
                        rows={3}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="submit" disabled={isSubmitting}>
                      {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                      {editingItem ? 'Update' : 'Simpan'}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Kriteria Dampak */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Kriteria Dampak</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nilai</TableHead>
                        <TableHead>Label</TableHead>
                        <TableHead className="text-right">Aksi</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {dampakCriteria.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell>
                            <Badge className={getValueColor(item.value)}>
                              {item.value}
                            </Badge>
                          </TableCell>
                          <TableCell>{item.scale}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEdit(item)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDelete(item)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                      {dampakCriteria.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={3} className="text-center py-4 text-muted-foreground">
                            Belum ada kriteria dampak
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              {/* Kriteria Probabilitas */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Kriteria Probabilitas</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nilai</TableHead>
                        <TableHead>Label</TableHead>
                        <TableHead className="text-right">Aksi</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {probabilitasCriteria.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell>
                            <Badge className={getValueColor(item.value)}>
                              {item.value}
                            </Badge>
                          </TableCell>
                          <TableCell>{item.scale}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEdit(item)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDelete(item)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                      {probabilitasCriteria.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={3} className="text-center py-4 text-muted-foreground">
                            Belum ada kriteria probabilitas
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}