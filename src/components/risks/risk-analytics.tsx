"use client"

import React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  BarChart3, 
  PieChart, 
  TrendingUp, 
  Calendar,
  Download,
  Filter
} from "lucide-react"

interface RiskAnalyticsData {
  riskByCategory: {
    category: string
    count: number
    percentage: number
    color: string
  }[]
  riskByLevel: {
    level: string
    count: number
    color: string
  }[]
  riskTrend: {
    month: string
    identified: number
    assessed: number
    treated: number
  }[]
  treatmentStatus: {
    status: string
    count: number
    percentage: number
  }[]
}

interface RiskAnalyticsProps {
  data?: RiskAnalyticsData
  isLoading?: boolean
}

function SimpleBarChart({ data, title }: { 
  data: { label: string; value: number; color: string }[]
  title: string 
}) {
  const maxValue = Math.max(...data.map(item => item.value))
  
  return (
    <div className="space-y-4">
      <h4 className="font-medium text-sm">{title}</h4>
      <div className="space-y-3">
        {data.map((item, index) => (
          <div key={index} className="space-y-1">
            <div className="flex justify-between text-sm">
              <span>{item.label}</span>
              <span className="font-medium">{item.value}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="h-2 rounded-full transition-all duration-300"
                style={{ 
                  width: `${(item.value / maxValue) * 100}%`,
                  backgroundColor: item.color 
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function DonutChart({ data, title }: { 
  data: { label: string; value: number; color: string }[]
  title: string 
}) {
  const total = data.reduce((sum, item) => sum + item.value, 0)
  
  return (
    <div className="space-y-4">
      <h4 className="font-medium text-sm">{title}</h4>
      <div className="space-y-3">
        {data.map((item, index) => {
          const percentage = total > 0 ? (item.value / total) * 100 : 0
          return (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div 
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-sm">{item.label}</span>
              </div>
              <div className="text-right">
                <div className="text-sm font-medium">{item.value}</div>
                <div className="text-xs text-muted-foreground">
                  {percentage.toFixed(1)}%
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function TrendChart({ data, title }: { 
  data: { month: string; identified: number; assessed: number; treated: number }[]
  title: string 
}) {
  const maxValue = Math.max(
    ...data.flatMap(item => [item.identified, item.assessed, item.treated])
  )
  
  return (
    <div className="space-y-4">
      <h4 className="font-medium text-sm">{title}</h4>
      <div className="space-y-4">
        {data.slice(-6).map((item, index) => (
          <div key={index} className="space-y-2">
            <div className="text-xs font-medium">{item.month}</div>
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span>Diidentifikasi</span>
                  <span>{item.identified}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-1">
                  <div
                    className="h-1 rounded-full bg-blue-500 transition-all duration-300"
                    style={{ width: `${(item.identified / maxValue) * 100}%` }}
                  />
                </div>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span>Dinilai</span>
                  <span>{item.assessed}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-1">
                  <div
                    className="h-1 rounded-full bg-yellow-500 transition-all duration-300"
                    style={{ width: `${(item.assessed / maxValue) * 100}%` }}
                  />
                </div>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span>Ditangani</span>
                  <span>{item.treated}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-1">
                  <div
                    className="h-1 rounded-full bg-green-500 transition-all duration-300"
                    style={{ width: `${(item.treated / maxValue) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export function RiskAnalytics({ data, isLoading = false }: RiskAnalyticsProps) {
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="h-6 w-48 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-8 w-32 bg-gray-200 rounded animate-pulse"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[...Array(4)].map((_, j) => (
                    <div key={j} className="space-y-2">
                      <div className="h-3 bg-gray-200 rounded animate-pulse"></div>
                      <div className="h-2 bg-gray-200 rounded animate-pulse"></div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="text-center py-12">
        <BarChart3 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-medium mb-2">Belum Ada Data Analitik</h3>
        <p className="text-muted-foreground">
          Data analitik akan muncul setelah ada risiko yang terdaftar
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Analitik Risiko</h2>
          <p className="text-muted-foreground">
            Visualisasi dan analisis data risiko
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Select defaultValue="last-3-months">
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="last-month">Bulan Lalu</SelectItem>
              <SelectItem value="last-3-months">3 Bulan Terakhir</SelectItem>
              <SelectItem value="last-6-months">6 Bulan Terakhir</SelectItem>
              <SelectItem value="last-year">Tahun Ini</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm">
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </Button>
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Risk by Category */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="w-5 h-5" />
              Risiko per Kategori
            </CardTitle>
          </CardHeader>
          <CardContent>
            <DonutChart
              data={data.riskByCategory.map(item => ({
                label: item.category,
                value: item.count,
                color: item.color
              }))}
              title=""
            />
          </CardContent>
        </Card>

        {/* Risk by Level */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Risiko per Level
            </CardTitle>
          </CardHeader>
          <CardContent>
            <SimpleBarChart
              data={data.riskByLevel.map(item => ({
                label: item.level,
                value: item.count,
                color: item.color
              }))}
              title=""
            />
          </CardContent>
        </Card>

        {/* Treatment Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Status Penanganan
            </CardTitle>
          </CardHeader>
          <CardContent>
            <DonutChart
              data={data.treatmentStatus.map(item => ({
                label: item.status,
                value: item.count,
                color: item.status === 'Selesai' ? '#10b981' :
                       item.status === 'Dalam Proses' ? '#f59e0b' :
                       item.status === 'Belum Mulai' ? '#6b7280' : '#ef4444'
              }))}
              title=""
            />
          </CardContent>
        </Card>
      </div>

      {/* Risk Trend Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Tren Risiko Bulanan
          </CardTitle>
        </CardHeader>
        <CardContent>
          <TrendChart
            data={data.riskTrend}
            title=""
          />
        </CardContent>
      </Card>

      {/* Key Insights */}
      <Card>
        <CardHeader>
          <CardTitle>Insight Utama</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <div className="text-2xl font-bold text-blue-600">
                {data.riskByCategory.reduce((sum, item) => sum + item.count, 0)}
              </div>
              <p className="text-sm text-muted-foreground">Total Risiko</p>
            </div>
            <div className="space-y-2">
              <div className="text-2xl font-bold text-red-600">
                {data.riskByLevel.find(item => item.level === 'Tinggi')?.count || 0}
              </div>
              <p className="text-sm text-muted-foreground">Risiko Tinggi</p>
            </div>
            <div className="space-y-2">
              <div className="text-2xl font-bold text-green-600">
                {data.treatmentStatus.find(item => item.status === 'Selesai')?.count || 0}
              </div>
              <p className="text-sm text-muted-foreground">Penanganan Selesai</p>
            </div>
            <div className="space-y-2">
              <div className="text-2xl font-bold text-yellow-600">
                {data.treatmentStatus.find(item => item.status === 'Dalam Proses')?.count || 0}
              </div>
              <p className="text-sm text-muted-foreground">Dalam Proses</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}