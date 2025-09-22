"use client"

import React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  BarChart3,
  Target,
  Activity
} from "lucide-react"
import { cn } from "@/lib/utils"

interface KRIData {
  id: string
  nama: string
  deskripsi: string
  satuan: string
  frekuensiPemantauan: string
  nilaiAktual: number
  targetValue: number
  warningThreshold: number
  criticalThreshold: number
  trend: 'up' | 'down' | 'stable'
  status: 'normal' | 'warning' | 'critical'
  lastUpdated: string
  penanggungJawab: string
  kategoriRisiko: string
}

interface KRIDashboardProps {
  kriData?: KRIData[]
  isLoading?: boolean
}

function getStatusColor(status: string): string {
  switch (status) {
    case "normal":
      return "bg-green-500 text-white"
    case "warning":
      return "bg-yellow-500 text-white"
    case "critical":
      return "bg-red-500 text-white"
    default:
      return "bg-gray-500 text-white"
  }
}

function getStatusIcon(status: string) {
  switch (status) {
    case "normal":
      return CheckCircle
    case "warning":
      return AlertTriangle
    case "critical":
      return AlertTriangle
    default:
      return Activity
  }
}

function getTrendIcon(trend: string) {
  switch (trend) {
    case "up":
      return TrendingUp
    case "down":
      return TrendingDown
    default:
      return BarChart3
  }
}

function calculatePercentage(actual: number, target: number): number {
  if (target === 0) return 0
  return Math.min((actual / target) * 100, 100)
}

function KRICard({ kri }: { kri: KRIData }) {
  const StatusIcon = getStatusIcon(kri.status)
  const TrendIcon = getTrendIcon(kri.trend)
  const percentage = calculatePercentage(kri.nilaiAktual, kri.targetValue)
  
  return (
    <Card className="relative overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-sm font-medium leading-none">
              {kri.nama}
            </CardTitle>
            <p className="text-xs text-muted-foreground">
              {kri.kategoriRisiko}
            </p>
          </div>
          <div className="flex items-center space-x-1">
            <Badge className={getStatusColor(kri.status)} variant="secondary">
              <StatusIcon className="w-3 h-3 mr-1" />
              {kri.status.toUpperCase()}
            </Badge>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Current Value */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-2xl font-bold">
              {kri.nilaiAktual.toLocaleString()} 
            </span>
            <div className="flex items-center space-x-1 text-xs text-muted-foreground">
              <TrendIcon className={cn(
                "w-3 h-3",
                kri.trend === "up" ? "text-red-500" :
                kri.trend === "down" ? "text-green-500" : "text-gray-500"
              )} />
              <span>{kri.satuan}</span>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="space-y-1">
            <Progress 
              value={percentage} 
              className={cn(
                "h-2",
                kri.status === "critical" ? "bg-red-100" :
                kri.status === "warning" ? "bg-yellow-100" : "bg-green-100"
              )}
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Target: {kri.targetValue.toLocaleString()} {kri.satuan}</span>
              <span>{percentage.toFixed(1)}%</span>
            </div>
          </div>
        </div>

        {/* Thresholds */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="space-y-1">
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
              <span>Warning: {kri.warningThreshold}</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              <span>Critical: {kri.criticalThreshold}</span>
            </div>
          </div>
          <div className="space-y-1 text-right">
            <div className="flex items-center justify-end space-x-1">
              <Clock className="w-3 h-3" />
              <span>{kri.frekuensiPemantauan}</span>
            </div>
            <div className="text-muted-foreground">
              Update: {new Date(kri.lastUpdated).toLocaleDateString()}
            </div>
          </div>
        </div>

        {/* Description */}
        <p className="text-xs text-muted-foreground">
          {kri.deskripsi}
        </p>
        
        {/* Responsible Person */}
        <div className="flex items-center justify-between pt-2 border-t">
          <span className="text-xs text-muted-foreground">
            PIC: {kri.penanggungJawab}
          </span>
          <Button variant="outline" size="sm" className="h-6 text-xs">
            Detail
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

export function KRIDashboard({ kriData, isLoading = false }: KRIDashboardProps) {
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="h-6 w-48 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-4 w-32 bg-gray-200 rounded animate-pulse mt-2"></div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-3 bg-gray-200 rounded animate-pulse w-2/3"></div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-2 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-16 bg-gray-200 rounded animate-pulse"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (!kriData || kriData.length === 0) {
    return (
      <div className="text-center py-12">
        <Target className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-medium mb-2">Belum Ada KRI</h3>
        <p className="text-muted-foreground mb-6">
          Mulai pantau performa risiko dengan menambah Key Risk Indicator
        </p>
        <Button>
          <Target className="w-4 h-4 mr-2" />
          Tambah KRI
        </Button>
      </div>
    )
  }

  // Calculate summary statistics
  const totalKRI = kriData.length
  const criticalKRI = kriData.filter(kri => kri.status === 'critical').length
  const warningKRI = kriData.filter(kri => kri.status === 'warning').length
  const normalKRI = kriData.filter(kri => kri.status === 'normal').length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Key Risk Indicators</h2>
          <p className="text-muted-foreground">
            Pantau indikator kunci risiko secara real-time
          </p>
        </div>
        <Button>
          <Target className="w-4 h-4 mr-2" />
          Tambah KRI
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total KRI</p>
                <p className="text-2xl font-bold">{totalKRI}</p>
              </div>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Critical</p>
                <p className="text-2xl font-bold text-red-600">{criticalKRI}</p>
              </div>
              <AlertTriangle className="h-4 w-4 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Warning</p>
                <p className="text-2xl font-bold text-yellow-600">{warningKRI}</p>
              </div>
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Normal</p>
                <p className="text-2xl font-bold text-green-600">{normalKRI}</p>
              </div>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* KRI Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {kriData.map((kri) => (
          <KRICard key={kri.id} kri={kri} />
        ))}
      </div>
    </div>
  )
}

// Export individual components for reuse
export { KRICard }