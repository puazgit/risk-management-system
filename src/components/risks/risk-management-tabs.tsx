"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Activity, Shield, Target, Plus, AlertCircle, TrendingUp, DollarSign, User, Calendar } from "lucide-react"
import { toast } from "sonner"

interface KRI {
  id: number
  indicatorName: string
  unitSatuan: string
  thresholdCategory: string | null
  thresholdValue: number | null
}

interface KontrolExisting {
  id: number
  controlType: string | null
  deskripsiDampak: string | null
  effectivenessRating: string | null
}

interface RiskTreatment {
  id: number
  treatmentOption: string | null
  treatmentPlan: string
  output: string
  costRupiah: number | null
  timelineMonths: number | null
  pic: {
    id: number
    name: string
    email: string
    unit: {
      name: string
    }
  }
}

interface RiskManagementTabsProps {
  riskId: number
}

const EFFECTIVENESS_RATINGS = [
  { value: "SANGAT_EFEKTIF", label: "Sangat Efektif", color: "bg-green-500" },
  { value: "EFEKTIF", label: "Efektif", color: "bg-blue-500" },
  { value: "CUKUP_EFEKTIF", label: "Cukup Efektif", color: "bg-yellow-500" },
  { value: "KURANG_EFEKTIF", label: "Kurang Efektif", color: "bg-orange-500" },
  { value: "TIDAK_EFEKTIF", label: "Tidak Efektif", color: "bg-red-500" },
]

const TREATMENT_OPTIONS = [
  { value: "MITIGATE", label: "Mitigate (Kurangi)", color: "bg-blue-500" },
  { value: "ACCEPT", label: "Accept (Terima)", color: "bg-green-500" },
  { value: "AVOID", label: "Avoid (Hindari)", color: "bg-yellow-500" },
  { value: "TRANSFER", label: "Transfer (Pindahkan)", color: "bg-purple-500" },
]

export function RiskManagementTabs({ riskId }: RiskManagementTabsProps) {
  const [kris, setKris] = useState<KRI[]>([])
  const [kontrols, setKontrols] = useState<KontrolExisting[]>([])
  const [treatments, setTreatments] = useState<RiskTreatment[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAllData()
  }, [riskId])

  const fetchAllData = async () => {
    try {
      setLoading(true)
      
      // Fetch KRIs
      const kriResponse = await fetch(`/api/master/kri?riskId=${riskId}`)
      if (kriResponse.ok) {
        const kriData = await kriResponse.json()
        if (kriData.success) {
          setKris(kriData.data)
        }
      }

      // Fetch Kontrol Existing
      const kontrolResponse = await fetch(`/api/master/kontrol-existing?riskId=${riskId}`)
      if (kontrolResponse.ok) {
        const kontrolData = await kontrolResponse.json()
        if (kontrolData.success) {
          setKontrols(kontrolData.data)
        }
      }

      // Fetch Risk Treatments
      const treatmentResponse = await fetch(`/api/master/risk-treatment?riskId=${riskId}`)
      if (treatmentResponse.ok) {
        const treatmentData = await treatmentResponse.json()
        if (treatmentData.success) {
          setTreatments(treatmentData.data)
        }
      }
    } catch (error) {
      console.error("Error fetching risk management data:", error)
      toast.error("Gagal memuat data manajemen risiko")
    } finally {
      setLoading(false)
    }
  }

  const getThresholdBadge = (category: string | null, value: number | null) => {
    if (!category || value === null) return <Badge variant="outline">Tidak diset</Badge>

    const color = category === "RED" ? "destructive" : 
                  category === "YELLOW" ? "default" : "secondary"

    return (
      <Badge variant={color} className="text-xs">
        {category}: {value}
      </Badge>
    )
  }

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
          <div className="text-muted-foreground">Memuat data manajemen risiko...</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <TrendingUp className="h-5 w-5" />
          <span>Manajemen Risiko</span>
        </CardTitle>
        <CardDescription>
          KRI, Kontrol Existing, dan Risk Treatment Plans untuk risiko ini
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="kri" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="kri" className="flex items-center space-x-2">
              <Activity className="w-4 h-4" />
              <span>KRI ({kris.length})</span>
            </TabsTrigger>
            <TabsTrigger value="kontrol" className="flex items-center space-x-2">
              <Shield className="w-4 h-4" />
              <span>Kontrol ({kontrols.length})</span>
            </TabsTrigger>
            <TabsTrigger value="treatment" className="flex items-center space-x-2">
              <Target className="w-4 h-4" />
              <span>Treatment ({treatments.length})</span>
            </TabsTrigger>
          </TabsList>

          {/* KRI Tab */}
          <TabsContent value="kri" className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium">Key Risk Indicators</h3>
              <Button size="sm" onClick={() => window.open('/master?tab=kri', '_blank')}>
                <Plus className="h-4 w-4 mr-2" />
                Kelola KRI
              </Button>
            </div>
            
            {kris.length === 0 ? (
              <div className="text-center py-8 border border-dashed rounded-lg">
                <Activity className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-muted-foreground">Belum ada KRI untuk risiko ini</p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-2"
                  onClick={() => window.open('/master?tab=kri', '_blank')}
                >
                  Tambah KRI
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nama Indikator</TableHead>
                      <TableHead>Unit/Satuan</TableHead>
                      <TableHead>Threshold</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {kris.map((kri) => (
                      <TableRow key={kri.id}>
                        <TableCell className="font-medium">
                          {kri.indicatorName}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{kri.unitSatuan}</Badge>
                        </TableCell>
                        <TableCell>
                          {getThresholdBadge(kri.thresholdCategory, kri.thresholdValue)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </TabsContent>

          {/* Kontrol Existing Tab */}
          <TabsContent value="kontrol" className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium">Kontrol Existing</h3>
              <Button size="sm" onClick={() => window.open('/master?tab=kontrol', '_blank')}>
                <Plus className="h-4 w-4 mr-2" />
                Kelola Kontrol
              </Button>
            </div>
            
            {kontrols.length === 0 ? (
              <div className="text-center py-8 border border-dashed rounded-lg">
                <Shield className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-muted-foreground">Belum ada kontrol existing untuk risiko ini</p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-2"
                  onClick={() => window.open('/master?tab=kontrol', '_blank')}
                >
                  Tambah Kontrol
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Jenis Kontrol</TableHead>
                      <TableHead>Efektivitas</TableHead>
                      <TableHead>Deskripsi Dampak</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {kontrols.map((kontrol) => (
                      <TableRow key={kontrol.id}>
                        <TableCell>
                          <Badge variant="outline">
                            {kontrol.controlType || "Tidak diset"}
                          </Badge>
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
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </TabsContent>

          {/* Risk Treatment Tab */}
          <TabsContent value="treatment" className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium">Risk Treatment Plans</h3>
              <Button size="sm" onClick={() => window.open('/master?tab=treatment', '_blank')}>
                <Plus className="h-4 w-4 mr-2" />
                Kelola Treatment
              </Button>
            </div>
            
            {treatments.length === 0 ? (
              <div className="text-center py-8 border border-dashed rounded-lg">
                <Target className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-muted-foreground">Belum ada risk treatment plans untuk risiko ini</p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-2"
                  onClick={() => window.open('/master?tab=treatment', '_blank')}
                >
                  Tambah Treatment Plan
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {treatments.map((treatment) => (
                  <Card key={treatment.id} className="border-l-4 border-l-blue-500">
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start">
                        <div className="space-y-1">
                          <CardTitle className="text-base">
                            {getTreatmentBadge(treatment.treatmentOption)}
                          </CardTitle>
                          <CardDescription className="text-sm">
                            <div className="flex items-center space-x-4 text-xs">
                              <div className="flex items-center space-x-1">
                                <User className="h-3 w-3" />
                                <span>{treatment.pic.name} ({treatment.pic.unit.name})</span>
                              </div>
                              {treatment.costRupiah && (
                                <div className="flex items-center space-x-1">
                                  <DollarSign className="h-3 w-3" />
                                  <span>{formatCurrency(treatment.costRupiah)}</span>
                                </div>
                              )}
                              {treatment.timelineMonths && (
                                <div className="flex items-center space-x-1">
                                  <Calendar className="h-3 w-3" />
                                  <span>{treatment.timelineMonths} bulan</span>
                                </div>
                              )}
                            </div>
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="space-y-2">
                        <div>
                          <label className="text-xs font-medium text-muted-foreground">Rencana:</label>
                          <p className="text-sm">{treatment.treatmentPlan}</p>
                        </div>
                        <div>
                          <label className="text-xs font-medium text-muted-foreground">Output:</label>
                          <p className="text-sm">{treatment.output}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}