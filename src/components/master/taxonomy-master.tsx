"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Edit, Trash2, Loader2 } from "lucide-react"
import { toast } from "sonner"

interface TaxonomyItem {
  id: number
  categoryBUMN: string
  categoryT2T3KBUMN: string
  description: string | null
  _count: {
    Risiko: number
  }
}

interface FormData {
  categoryBUMN: string
  categoryT2T3KBUMN: string
  description: string
}

export function TaxonomyMaster() {
  const [taxonomies, setTaxonomies] = useState<TaxonomyItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<TaxonomyItem | null>(null)
  const [formData, setFormData] = useState<FormData>({
    categoryBUMN: "",
    categoryT2T3KBUMN: "",
    description: ""
  })

  useEffect(() => {
    loadTaxonomies()
  }, [])

  const loadTaxonomies = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/master/taxonomy')
      
      if (!response.ok) {
        throw new Error('Failed to fetch taxonomies')
      }
      
      const result = await response.json()
      setTaxonomies(result.data)
    } catch (error) {
      console.error('Error loading taxonomies:', error)
      toast.error('Gagal memuat data taksonomi')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.categoryBUMN || !formData.categoryT2T3KBUMN) {
      toast.error('Silakan lengkapi semua field yang wajib')
      return
    }

    try {
      setIsSubmitting(true)
      
      const url = editingItem 
        ? `/api/master/taxonomy/${editingItem.id}`
        : '/api/master/taxonomy'
      
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
        throw new Error(error.message || 'Failed to save taxonomy')
      }

      toast.success(editingItem ? 'Taksonomi berhasil diupdate' : 'Taksonomi berhasil ditambahkan')
      setIsDialogOpen(false)
      resetForm()
      loadTaxonomies()
    } catch (error) {
      console.error('Error saving taxonomy:', error)
      toast.error(error instanceof Error ? error.message : 'Gagal menyimpan taksonomi')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEdit = (item: TaxonomyItem) => {
    setEditingItem(item)
    setFormData({
      categoryBUMN: item.categoryBUMN,
      categoryT2T3KBUMN: item.categoryT2T3KBUMN,
      description: item.description || ""
    })
    setIsDialogOpen(true)
  }

  const handleDelete = async (item: TaxonomyItem) => {
    if (item._count.Risiko > 0) {
      toast.error('Tidak dapat menghapus taksonomi yang sedang digunakan oleh risiko')
      return
    }

    if (!confirm('Apakah Anda yakin ingin menghapus taksonomi ini?')) {
      return
    }

    try {
      const response = await fetch(`/api/master/taxonomy/${item.id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to delete taxonomy')
      }

      toast.success('Taksonomi berhasil dihapus')
      loadTaxonomies()
    } catch (error) {
      console.error('Error deleting taxonomy:', error)
      toast.error(error instanceof Error ? error.message : 'Gagal menghapus taksonomi')
    }
  }

  const resetForm = () => {
    setFormData({
      categoryBUMN: "",
      categoryT2T3KBUMN: "",
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

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Taksonomi Risiko</CardTitle>
            <CardDescription>
              Kelola kategori dan klasifikasi risiko organisasi
            </CardDescription>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={handleDialogOpenChange}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Tambah Taksonomi
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[525px]">
              <form onSubmit={handleSubmit}>
                <DialogHeader>
                  <DialogTitle>
                    {editingItem ? 'Edit Taksonomi' : 'Tambah Taksonomi Baru'}
                  </DialogTitle>
                  <DialogDescription>
                    {editingItem 
                      ? 'Ubah data taksonomi risiko' 
                      : 'Tambahkan kategori taksonomi risiko baru'
                    }
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="categoryBUMN">Kategori BUMN *</Label>
                    <Input
                      id="categoryBUMN"
                      value={formData.categoryBUMN}
                      onChange={(e) => setFormData({...formData, categoryBUMN: e.target.value})}
                      placeholder="Contoh: Risiko Operasional"
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="categoryT2T3KBUMN">Kategori T2T3K BUMN *</Label>
                    <Input
                      id="categoryT2T3KBUMN"
                      value={formData.categoryT2T3KBUMN}
                      onChange={(e) => setFormData({...formData, categoryT2T3KBUMN: e.target.value})}
                      placeholder="Contoh: Risiko Proses Bisnis"
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="description">Deskripsi</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      placeholder="Deskripsi kategori risiko..."
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
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Kategori BUMN</TableHead>
                <TableHead>Kategori T2T3K BUMN</TableHead>
                <TableHead>Deskripsi</TableHead>
                <TableHead>Risiko Terkait</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {taxonomies.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.categoryBUMN}</TableCell>
                  <TableCell>{item.categoryT2T3KBUMN}</TableCell>
                  <TableCell className="max-w-xs truncate">
                    {item.description || '-'}
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">
                      {item._count.Risiko} risiko
                    </Badge>
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
                        disabled={item._count.Risiko > 0}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {taxonomies.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    Belum ada data taksonomi risiko
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