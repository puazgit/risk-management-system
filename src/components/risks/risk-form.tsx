"use client"

import React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Separator } from "@/components/ui/separator"
import { Save, Plus } from "lucide-react"

const riskFormSchema = z.object({
  sasaranId: z.number().min(1, "Sasaran strategis harus dipilih"),
  ownerUnitId: z.number().min(1, "Unit pemilik harus dipilih"),
  kategoriId: z.number().min(1, "Kategori risiko harus dipilih"),
  namaRisiko: z.string().min(1, "Nama risiko harus diisi"),
  deskripsi: z.string().optional(),
  riskNumber: z.string().optional(),
})

type RiskFormData = z.infer<typeof riskFormSchema>

interface DropdownOption {
  value: number
  label: string
}

interface RiskFormProps {
  initialData?: Partial<RiskFormData>
  sasaranOptions: DropdownOption[]
  unitOptions: DropdownOption[]
  kategoriOptions: DropdownOption[]
  isLoading?: boolean
  onSubmit: (data: RiskFormData) => Promise<void>
  onCancel?: () => void
  submitLabel?: string
  mode?: 'create' | 'edit'
}

export function RiskForm({
  initialData,
  sasaranOptions,
  unitOptions,
  kategoriOptions,
  isLoading = false,
  onSubmit,
  onCancel,
  submitLabel = "Simpan",
  mode = 'create'
}: RiskFormProps) {
  const form = useForm<RiskFormData>({
    resolver: zodResolver(riskFormSchema),
    defaultValues: {
      sasaranId: initialData?.sasaranId || 0,
      ownerUnitId: initialData?.ownerUnitId || 0,
      kategoriId: initialData?.kategoriId || 0,
      namaRisiko: initialData?.namaRisiko || "",
      deskripsi: initialData?.deskripsi || "",
      riskNumber: initialData?.riskNumber || "",
    },
  })

  const handleSubmit = async (data: RiskFormData) => {
    try {
      await onSubmit(data)
    } catch (error) {
      console.error("Error submitting form:", error)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {mode === 'create' ? 'Tambah Risiko Baru' : 'Edit Risiko'}
        </CardTitle>
        <CardDescription>
          {mode === 'create' 
            ? 'Masukkan informasi risiko yang akan diidentifikasi'
            : 'Perbarui informasi risiko yang ada'
          }
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            {/* Risk Number (only show in edit mode) */}
            {mode === 'edit' && (
              <FormField
                control={form.control}
                name="riskNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nomor Risiko</FormLabel>
                    <FormControl>
                      <Input 
                        {...field} 
                        placeholder="Akan di-generate otomatis"
                        className="font-mono"
                        disabled
                      />
                    </FormControl>
                    <FormDescription>
                      Nomor risiko di-generate otomatis oleh sistem
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* Basic Information */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full" />
                <h3 className="text-lg font-medium">Informasi Dasar</h3>
              </div>
              
              <FormField
                control={form.control}
                name="namaRisiko"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nama Risiko *</FormLabel>
                    <FormControl>
                      <Input 
                        {...field} 
                        placeholder="Masukkan nama risiko"
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormDescription>
                      Berikan nama yang jelas dan spesifik untuk risiko ini
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="deskripsi"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Deskripsi Risiko</FormLabel>
                    <FormControl>
                      <Textarea 
                        {...field} 
                        placeholder="Jelaskan detail risiko, penyebab, dan dampak yang mungkin terjadi"
                        rows={4}
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormDescription>
                      Penjelasan detail tentang risiko termasuk penyebab dan dampak
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Separator />

            {/* Categorization */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full" />
                <h3 className="text-lg font-medium">Kategorisasi</h3>
              </div>

              <FormField
                control={form.control}
                name="kategoriId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Kategori Risiko *</FormLabel>
                    <Select 
                      onValueChange={(value) => field.onChange(parseInt(value))}
                      value={field.value ? field.value.toString() : ""}
                      disabled={isLoading}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih kategori risiko" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {kategoriOptions.map((option) => (
                          <SelectItem 
                            key={option.value} 
                            value={option.value.toString()}
                          >
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Pilih kategori risiko sesuai taksonomi BUMN
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="sasaranId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sasaran Strategis *</FormLabel>
                    <Select 
                      onValueChange={(value) => field.onChange(parseInt(value))}
                      value={field.value ? field.value.toString() : ""}
                      disabled={isLoading}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih sasaran strategis" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {sasaranOptions.map((option) => (
                          <SelectItem 
                            key={option.value} 
                            value={option.value.toString()}
                          >
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Sasaran strategis yang terancam oleh risiko ini
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="ownerUnitId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Unit Pemilik Risiko *</FormLabel>
                    <Select 
                      onValueChange={(value) => field.onChange(parseInt(value))}
                      value={field.value ? field.value.toString() : ""}
                      disabled={isLoading}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih unit pemilik" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {unitOptions.map((option) => (
                          <SelectItem 
                            key={option.value} 
                            value={option.value.toString()}
                          >
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Unit kerja yang bertanggung jawab mengelola risiko ini
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Separator />

            {/* Action Buttons */}
            <div className="flex items-center justify-end space-x-2">
              {onCancel && (
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={onCancel}
                  disabled={isLoading}
                >
                  Batal
                </Button>
              )}
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Menyimpan...
                  </>
                ) : (
                  <>
                    {mode === 'create' ? (
                      <Plus className="h-4 w-4 mr-2" />
                    ) : (
                      <Save className="h-4 w-4 mr-2" />
                    )}
                    {submitLabel}
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}