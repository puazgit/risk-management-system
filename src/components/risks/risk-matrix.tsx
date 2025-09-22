"use client"

import React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Download, RefreshCw } from "lucide-react"

interface RiskMatrixData {
  type: 'inherent' | 'residual'
  matrixGrid: Array<Array<{
    impact: number
    probability: number
    exposure: number
    level: string
    risks: Array<{
      id: number
      riskNumber: string
      namaRisiko: string
      kategori: string
      unit: string
    }>
    count: number
  }>>
  levelStats: {
    VERY_HIGH: number
    HIGH: number
    MODERATE: number
    LOW: number
    VERY_LOW: number
  }
  totalRisks: number
}

interface RiskMatrixProps {
  data?: RiskMatrixData
  isLoading?: boolean
  onTypeChange?: (type: 'inherent' | 'residual') => void
  onExport?: () => void
  onRefresh?: () => void
}

function getRiskLevelColor(level: string): string {
  switch (level) {
    case "VERY_HIGH":
      return "bg-red-500"
    case "HIGH":
      return "bg-orange-500"
    case "MODERATE":
      return "bg-yellow-500"
    case "LOW":
      return "bg-green-500"
    case "VERY_LOW":
      return "bg-blue-500"
    default:
      return "bg-gray-300"
  }
}

function getRiskLevelText(level: string): string {
  switch (level) {
    case "VERY_HIGH":
      return "Sangat Tinggi"
    case "HIGH":
      return "Tinggi"
    case "MODERATE":
      return "Sedang"
    case "LOW":
      return "Rendah"
    case "VERY_LOW":
      return "Sangat Rendah"
    default:
      return level
  }
}

export function RiskMatrix({ 
  data, 
  isLoading = false, 
  onTypeChange, 
  onExport,
  onRefresh 
}: RiskMatrixProps) {
  const probabilityLabels = ["Sangat Rendah", "Rendah", "Sedang", "Tinggi", "Sangat Tinggi"]
  const impactLabels = ["Sangat Tinggi", "Tinggi", "Sedang", "Rendah", "Sangat Rendah"]

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Risk Matrix</CardTitle>
              <CardDescription>
                Visualisasi pemetaan risiko berdasarkan dampak dan probabilitas
              </CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <Select disabled>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Loading..." />
                </SelectTrigger>
              </Select>
              <Button variant="outline" size="sm" disabled>
                <RefreshCw className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" disabled>
                <Download className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-6 gap-2">
            <div></div>
            {probabilityLabels.map((label, i) => (
              <div key={i} className="text-center text-sm font-medium p-2">
                {label}
              </div>
            ))}
            {impactLabels.map((impactLabel, impactIndex) => (
              <React.Fragment key={impactIndex}>
                <div className="text-center text-sm font-medium p-2 border-r">
                  {impactLabel}
                </div>
                {probabilityLabels.map((_, probIndex) => (
                  <div
                    key={probIndex}
                    className="h-20 border rounded bg-gray-200 animate-pulse"
                  />
                ))}
              </React.Fragment>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!data) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Risk Matrix</CardTitle>
          <CardDescription>
            Tidak ada data untuk ditampilkan
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64 text-muted-foreground">
            Tidak ada data risiko
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Risk Matrix */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Risk Matrix</CardTitle>
              <CardDescription>
                Visualisasi pemetaan risiko berdasarkan dampak dan probabilitas ({data.totalRisks} risiko)
              </CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <Select 
                value={data.type} 
                onValueChange={(value) => onTypeChange?.(value as 'inherent' | 'residual')}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="inherent">Risiko Inheren</SelectItem>
                  <SelectItem value="residual">Risiko Residual</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="sm" onClick={onRefresh}>
                <RefreshCw className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={onExport}>
                <Download className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <div className="grid grid-cols-6 gap-2 min-w-[600px]">
              {/* Header row */}
              <div className="text-center font-medium p-2"></div>
              {probabilityLabels.map((label, i) => (
                <div key={i} className="text-center text-sm font-medium p-2">
                  <div className="rotate-0">{label}</div>
                  <div className="text-xs text-muted-foreground">({i + 1})</div>
                </div>
              ))}

              {/* Matrix rows */}
              {data.matrixGrid.map((row, impactIndex) => (
                <React.Fragment key={impactIndex}>
                  <div className="text-center text-sm font-medium p-2 border-r">
                    <div>{impactLabels[impactIndex]}</div>
                    <div className="text-xs text-muted-foreground">({5 - impactIndex})</div>
                  </div>
                  {row.map((cell, probIndex) => (
                    <div
                      key={probIndex}
                      className={`
                        relative h-20 border rounded cursor-pointer transition-opacity hover:opacity-80
                        ${getRiskLevelColor(cell.level)}
                      `}
                      title={`${cell.count} risiko | Exposure: ${cell.exposure} | Level: ${getRiskLevelText(cell.level)}`}
                    >
                      <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
                        <div className="text-lg font-bold">{cell.count}</div>
                        <div className="text-xs">({cell.exposure})</div>
                      </div>
                      {cell.count > 0 && (
                        <div className="absolute top-1 right-1">
                          <div className="w-2 h-2 bg-white rounded-full opacity-75" />
                        </div>
                      )}
                    </div>
                  ))}
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* Legend */}
          <div className="mt-6 pt-4 border-t">
            <div className="flex items-center justify-between">
              <div className="text-sm font-medium">Legend:</div>
              <div className="flex items-center space-x-4">
                {Object.entries(data.levelStats).map(([level, count]) => (
                  <div key={level} className="flex items-center space-x-2">
                    <div className={`w-4 h-4 rounded ${getRiskLevelColor(level)}`} />
                    <span className="text-sm">
                      {getRiskLevelText(level)} ({count})
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Risk Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {Object.entries(data.levelStats).map(([level, count]) => (
          <Card key={level}>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded ${getRiskLevelColor(level)}`} />
                <div className="text-2xl font-bold">{count}</div>
              </div>
              <p className="text-xs text-muted-foreground">
                {getRiskLevelText(level)}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}