"use client"

import React, { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { CalendarIcon, AlertTriangle, TrendingUp, Shield } from "lucide-react"
import { cn } from "@/lib/utils"

const assessmentSchema = z.object({
  // Identifikasi Risiko
  jenisRisiko: z.string().min(1, "Jenis risiko harus dipilih"),
  sumberRisiko: z.string().min(1, "Sumber risiko harus diisi"),
  
  // Penilaian Risiko Inheren
  probabilitasInheren: z.number().min(1).max(5),
  dampakInheren: z.number().min(1).max(5),
  
  // Penilaian Risiko Residual
  probabilitasResidual: z.number().min(1).max(5),
  dampakResidual: z.number().min(1).max(5),
  
  // Kontrol yang Ada
  kontrolYangAda: z.string().min(1, "Kontrol yang ada harus diisi"),
  efektivitasKontrol: z.enum(["SANGAT_EFEKTIF", "EFEKTIF", "CUKUP_EFEKTIF", "KURANG_EFEKTIF", "TIDAK_EFEKTIF"]),
  
  // Rencana Tindak Lanjut
  rencanaRespon: z.enum(["HINDARI", "MITIGASI", "TRANSFER", "TERIMA"]),
  targetWaktu: z.string().optional(),
  penanggungJawab: z.string().min(1, "Penanggung jawab harus diisi"),
  catatan: z.string().optional()
})

type AssessmentFormData = z.infer<typeof assessmentSchema>

interface AssessmentFormProps {
  riskId?: string
  initialData?: Partial<AssessmentFormData>
  onSubmit: (data: AssessmentFormData) => Promise<void>
  isSubmitting?: boolean
}

const riskTypes = [
  { value: "OPERASIONAL", label: "Operasional" },
  { value: "KREDIT", label: "Kredit" },
  { value: "PASAR", label: "Pasar" },
  { value: "LIKUIDITAS", label: "Likuiditas" },
  { value: "REPUTASI", label: "Reputasi" },
  { value: "STRATEGIS", label: "Strategis" },
  { value: "KEPATUHAN", label: "Kepatuhan" },
  { value: "HUKUM", label: "Hukum" }
]

const riskLevels = [
  { value: 1, label: "Sangat Rendah", color: "bg-green-500" },
  { value: 2, label: "Rendah", color: "bg-lime-500" },
  { value: 3, label: "Sedang", color: "bg-yellow-500" },
  { value: 4, label: "Tinggi", color: "bg-orange-500" },
  { value: 5, label: "Sangat Tinggi", color: "bg-red-500" }
]

const controlEffectiveness = [
  { value: "SANGAT_EFEKTIF", label: "Sangat Efektif" },
  { value: "EFEKTIF", label: "Efektif" },
  { value: "CUKUP_EFEKTIF", label: "Cukup Efektif" },
  { value: "KURANG_EFEKTIF", label: "Kurang Efektif" },
  { value: "TIDAK_EFEKTIF", label: "Tidak Efektif" }
]

const responseStrategies = [
  { value: "HINDARI", label: "Hindari", description: "Menghindari aktivitas yang menimbulkan risiko" },
  { value: "MITIGASI", label: "Mitigasi", description: "Mengurangi kemungkinan atau dampak risiko" },
  { value: "TRANSFER", label: "Transfer", description: "Memindahkan risiko ke pihak lain" },
  { value: "TERIMA", label: "Terima", description: "Menerima risiko dengan pengawasan ketat" }
]

function calculateRiskScore(probability: number, impact: number): number {
  return probability * impact
}

function getRiskLevel(score: number): { level: string; color: string } {
  if (score >= 20) return { level: "Sangat Tinggi", color: "bg-red-500 text-white" }
  if (score >= 15) return { level: "Tinggi", color: "bg-orange-500 text-white" }
  if (score >= 10) return { level: "Sedang", color: "bg-yellow-500 text-white" }
  if (score >= 5) return { level: "Rendah", color: "bg-lime-500 text-white" }
  return { level: "Sangat Rendah", color: "bg-green-500 text-white" }
}

export function AssessmentForm({ riskId, initialData, onSubmit, isSubmitting = false }: AssessmentFormProps) {
  const [step, setStep] = useState(1)
  
  const form = useForm<AssessmentFormData>({
    resolver: zodResolver(assessmentSchema),
    defaultValues: {
      jenisRisiko: "",
      sumberRisiko: "",
      probabilitasInheren: 1,
      dampakInheren: 1,
      probabilitasResidual: 1,
      dampakResidual: 1,
      kontrolYangAda: "",
      efektivitasKontrol: "CUKUP_EFEKTIF",
      rencanaRespon: "MITIGASI",
      targetWaktu: "",
      penanggungJawab: "",
      catatan: "",
      ...initialData
    }
  })

  const watchedValues = form.watch()
  const inherentScore = calculateRiskScore(watchedValues.probabilitasInheren, watchedValues.dampakInheren)
  const residualScore = calculateRiskScore(watchedValues.probabilitasResidual, watchedValues.dampakResidual)
  const inherentLevel = getRiskLevel(inherentScore)
  const residualLevel = getRiskLevel(residualScore)

  const handleSubmit = async (data: AssessmentFormData) => {
    try {
      await onSubmit(data)
    } catch (error) {
      console.error("Error submitting assessment:", error)
    }
  }

  const nextStep = () => {
    if (step < 4) setStep(step + 1)
  }

  const prevStep = () => {
    if (step > 1) setStep(step - 1)
  }

  const steps = [
    { number: 1, title: "Identifikasi", icon: AlertTriangle },
    { number: 2, title: "Penilaian Inheren", icon: TrendingUp },
    { number: 3, title: "Kontrol & Residual", icon: Shield },
    { number: 4, title: "Rencana Tindak Lanjut", icon: CalendarIcon }
  ]

  return (
    <div className="space-y-6">
      {/* Step Indicator */}
      <div className="flex items-center justify-between">
        {steps.map((stepItem, index) => {
          const Icon = stepItem.icon
          return (
            <div key={stepItem.number} className="flex items-center">
              <div
                className={cn(
                  "flex items-center justify-center w-10 h-10 rounded-full border-2",
                  step >= stepItem.number
                    ? "bg-primary border-primary text-primary-foreground"
                    : "border-muted-foreground text-muted-foreground"
                )}
              >
                <Icon className="w-4 h-4" />
              </div>
              <div className="ml-2">
                <div className="text-sm font-medium">{stepItem.title}</div>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={cn(
                    "w-16 h-0.5 mx-4",
                    step > stepItem.number ? "bg-primary" : "bg-muted"
                  )}
                />
              )}
            </div>
          )
        })}
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          {/* Step 1: Identifikasi Risiko */}
          {step === 1 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5" />
                  Identifikasi Risiko
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="jenisRisiko"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Jenis Risiko</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Pilih jenis risiko" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {riskTypes.map((type) => (
                            <SelectItem key={type.value} value={type.value}>
                              {type.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="sumberRisiko"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sumber Risiko</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Jelaskan sumber atau penyebab utama risiko ini..."
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          )}

          {/* Step 2: Penilaian Risiko Inheren */}
          {step === 2 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Penilaian Risiko Inheren
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="probabilitasInheren"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Probabilitas</FormLabel>
                        <FormControl>
                          <RadioGroup
                            onValueChange={(value: string) => field.onChange(Number(value))}
                            defaultValue={field.value?.toString()}
                            className="space-y-2"
                          >
                            {riskLevels.map((level) => (
                              <div key={level.value} className="flex items-center space-x-2">
                                <RadioGroupItem value={level.value.toString()} />
                                <div className="flex items-center space-x-2">
                                  <div className={cn("w-4 h-4 rounded", level.color)} />
                                  <span>{level.value} - {level.label}</span>
                                </div>
                              </div>
                            ))}
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="dampakInheren"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Dampak</FormLabel>
                        <FormControl>
                          <RadioGroup
                            onValueChange={(value: string) => field.onChange(Number(value))}
                            defaultValue={field.value?.toString()}
                            className="space-y-2"
                          >
                            {riskLevels.map((level) => (
                              <div key={level.value} className="flex items-center space-x-2">
                                <RadioGroupItem value={level.value.toString()} />
                                <div className="flex items-center space-x-2">
                                  <div className={cn("w-4 h-4 rounded", level.color)} />
                                  <span>{level.value} - {level.label}</span>
                                </div>
                              </div>
                            ))}
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Risk Score Display */}
                <div className="p-4 bg-muted rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Skor Risiko Inheren:</span>
                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-bold">{inherentScore}</span>
                      <Badge className={inherentLevel.color}>
                        {inherentLevel.level}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 3: Kontrol dan Risiko Residual */}
          {step === 3 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Kontrol yang Ada & Risiko Residual
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <FormField
                  control={form.control}
                  name="kontrolYangAda"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Kontrol yang Sudah Ada</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Jelaskan kontrol atau mitigasi yang sudah diterapkan..."
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="efektivitasKontrol"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Efektivitas Kontrol</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Pilih efektivitas kontrol" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {controlEffectiveness.map((effectiveness) => (
                            <SelectItem key={effectiveness.value} value={effectiveness.value}>
                              {effectiveness.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Separator />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="probabilitasResidual"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Probabilitas Residual</FormLabel>
                        <FormControl>
                          <RadioGroup
                            onValueChange={(value: string) => field.onChange(Number(value))}
                            defaultValue={field.value?.toString()}
                            className="space-y-2"
                          >
                            {riskLevels.map((level) => (
                              <div key={level.value} className="flex items-center space-x-2">
                                <RadioGroupItem value={level.value.toString()} />
                                <div className="flex items-center space-x-2">
                                  <div className={cn("w-4 h-4 rounded", level.color)} />
                                  <span>{level.value} - {level.label}</span>
                                </div>
                              </div>
                            ))}
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="dampakResidual"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Dampak Residual</FormLabel>
                        <FormControl>
                          <RadioGroup
                            onValueChange={(value: string) => field.onChange(Number(value))}
                            defaultValue={field.value?.toString()}
                            className="space-y-2"
                          >
                            {riskLevels.map((level) => (
                              <div key={level.value} className="flex items-center space-x-2">
                                <RadioGroupItem value={level.value.toString()} />
                                <div className="flex items-center space-x-2">
                                  <div className={cn("w-4 h-4 rounded", level.color)} />
                                  <span>{level.value} - {level.label}</span>
                                </div>
                              </div>
                            ))}
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Residual Risk Score Display */}
                <div className="p-4 bg-muted rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Skor Risiko Residual:</span>
                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-bold">{residualScore}</span>
                      <Badge className={residualLevel.color}>
                        {residualLevel.level}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 4: Rencana Tindak Lanjut */}
          {step === 4 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CalendarIcon className="w-5 h-5" />
                  Rencana Tindak Lanjut
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <FormField
                  control={form.control}
                  name="rencanaRespon"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Strategi Respon Risiko</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="space-y-3"
                        >
                          {responseStrategies.map((strategy) => (
                            <div key={strategy.value} className="flex items-start space-x-2">
                              <RadioGroupItem value={strategy.value} className="mt-1" />
                              <div>
                                <div className="font-medium">{strategy.label}</div>
                                <div className="text-sm text-muted-foreground">
                                  {strategy.description}
                                </div>
                              </div>
                            </div>
                          ))}
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="targetWaktu"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Target Waktu Penyelesaian</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="penanggungJawab"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Penanggung Jawab</FormLabel>
                        <FormControl>
                          <Input placeholder="Nama penanggung jawab" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="catatan"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Catatan Tambahan</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Catatan atau informasi tambahan..."
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={prevStep}
              disabled={step === 1}
            >
              Sebelumnya
            </Button>

            <div className="flex gap-2">
              {step < 4 ? (
                <Button type="button" onClick={nextStep}>
                  Selanjutnya
                </Button>
              ) : (
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Menyimpan..." : "Simpan Penilaian"}
                </Button>
              )}
            </div>
          </div>
        </form>
      </Form>
    </div>
  )
}