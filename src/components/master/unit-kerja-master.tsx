"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Edit, Trash2, Loader2, Building, Users, Target, AlertTriangle } from "lucide-react"
import { toast } from "sonner"

interface UnitKerjaItem {
  id: number
  code: string
  name: string
  hierarchyLevel: string | null
  _count: {
    users: number
    Risiko: number
    SasaranStrategis: number
  }
}

interface FormData {
  code: string
  name: string
  hierarchyLevel: string
}

export function UnitKerjaMaster() {
  const [units, setUnits] = useState<UnitKerjaItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<UnitKerjaItem | null>(null)
  const [formData, setFormData] = useState<FormData>({
    code: "",
    name: "",
    hierarchyLevel: ""
  })

  useEffect(() => {
    loadUnits()
  }, [])

  const loadUnits = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/master/units')
      
      if (!response.ok) {
        throw new Error('Failed to fetch units')
      }
      
      const result = await response.json()
      setUnits(result.data)
    } catch (error) {
      console.error('Error loading units:', error)
      toast.error('Gagal memuat data unit kerja')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.code || !formData.name) {
      toast.error('Silakan lengkapi semua field yang wajib')
      return
    }

    try {
      setIsSubmitting(true)
      
      const url = editingItem 
        ? `/api/master/units/${editingItem.id}`
        : '/api/master/units'
      
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
        throw new Error(error.message || 'Failed to save unit kerja')
      }

      toast.success(editingItem ? 'Unit kerja berhasil diupdate' : 'Unit kerja berhasil ditambahkan')
      setIsDialogOpen(false)
      resetForm()
      loadUnits()
    } catch (error) {
      console.error('Error saving unit kerja:', error)
      toast.error(error instanceof Error ? error.message : 'Gagal menyimpan unit kerja')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEdit = (item: UnitKerjaItem) => {
    setEditingItem(item)
    setFormData({
      code: item.code,
      name: item.name,
      hierarchyLevel: item.hierarchyLevel || ""
    })
    setIsDialogOpen(true)
  }

  const handleDelete = async (item: UnitKerjaItem) => {
    const totalUsage = item._count.users + item._count.Risiko + item._count.SasaranStrategis
    
    if (totalUsage > 0) {
      toast.error('Tidak dapat menghapus unit kerja yang sedang digunakan')
      return
    }

    if (!confirm('Apakah Anda yakin ingin menghapus unit kerja ini?')) {
      return
    }

    try {
      const response = await fetch(`/api/master/units/${item.id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to delete unit kerja')
      }

      toast.success('Unit kerja berhasil dihapus')
      loadUnits()
    } catch (error) {
      console.error('Error deleting unit kerja:', error)
      toast.error(error instanceof Error ? error.message : 'Gagal menghapus unit kerja')
    }
  }

  const resetForm = () => {
    setFormData({
      code: "",
      name: "",
      hierarchyLevel: ""
    })
    setEditingItem(null)
  }

  const handleDialogOpenChange = (open: boolean) => {
    setIsDialogOpen(open)
    if (!open) {
      resetForm()
    }
  }

  const getHierarchyBadgeColor = (level: string | null) => {
    switch (level) {
      case "Lini Pertama":
        return "bg-blue-100 text-blue-800"
      case "Lini Kedua":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center space-x-2">
              <Building className="h-5 w-5 text-blue-600" />
              <span>Unit Kerja</span>
            </CardTitle>
            <CardDescription>
              Kelola unit kerja dan struktur organisasi untuk manajemen risiko
            </CardDescription>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={handleDialogOpenChange}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Tambah Unit Kerja
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[525px]">
              <form onSubmit={handleSubmit}>
                <DialogHeader>
                  <DialogTitle>
                    {editingItem ? 'Edit Unit Kerja' : 'Tambah Unit Kerja Baru'}
                  </DialogTitle>
                  <DialogDescription>
                    {editingItem 
                      ? 'Ubah data unit kerja' 
                      : 'Tambahkan unit kerja baru untuk struktur organisasi'
                    }
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="code">Kode Unit *</Label>
                    <Input
                      id="code"
                      value={formData.code}
                      onChange={(e) => setFormData({...formData, code: e.target.value})}
                      placeholder="Contoh: IT, HR, FIN"
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="name">Nama Unit Kerja *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      placeholder="Contoh: Divisi Teknologi Informasi"
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="hierarchyLevel">Tingkat Hierarki</Label>
                    <Select 
                      value={formData.hierarchyLevel} 
                      onValueChange={(value) => setFormData({...formData, hierarchyLevel: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih tingkat hierarki" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Lini Pertama">Lini Pertama</SelectItem>
                        <SelectItem value="Lini Kedua">Lini Kedua</SelectItem>
                      </SelectContent>
                    </Select>
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
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Kode</TableHead>
                <TableHead>Nama Unit Kerja</TableHead>
                <TableHead>Tingkat Hierarki</TableHead>
                <TableHead>Users</TableHead>
                <TableHead>Risiko</TableHead>
                <TableHead>Sasaran</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {units.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.code}</TableCell>
                  <TableCell>{item.name}</TableCell>
                  <TableCell>
                    {item.hierarchyLevel ? (
                      <Badge className={getHierarchyBadgeColor(item.hierarchyLevel)}>
                        {item.hierarchyLevel}
                      </Badge>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-1">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span>{item._count.users}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-1">
                      <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                      <span>{item._count.Risiko}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-1">
                      <Target className="h-4 w-4 text-muted-foreground" />
                      <span>{item._count.SasaranStrategis}</span>
                    </div>
                  </TableCell>
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
                        disabled={item._count.users + item._count.Risiko + item._count.SasaranStrategis > 0}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {units.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    Belum ada data unit kerja
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )
}