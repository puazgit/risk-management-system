"use client"

import React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, TrendingDown, AlertTriangle, Shield, Activity } from "lucide-react"

interface RiskOverviewData {
  totalRisks: number
  highRisks: number
  newRisks: number
  assessedRisks: number
  overdueTreatments: number
  riskTrend: 'up' | 'down' | 'stable'
  complianceScore: number
}

interface RiskOverviewCardsProps {
  data?: RiskOverviewData
  isLoading?: boolean
}

function getRiskLevelColor(level: string): string {
  switch (level) {
    case "high":
      return "bg-red-500 text-white"
    case "medium":
      return "bg-yellow-500 text-white"
    case "low":
      return "bg-green-500 text-white"
    default:
      return "bg-gray-500 text-white"
  }
}

export function RiskOverviewCards({ data, isLoading = false }: RiskOverviewCardsProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
              </CardTitle>
              <div className="h-4 w-4 bg-gray-200 rounded animate-pulse"></div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
              </div>
              <div className="text-xs text-muted-foreground mt-2">
                <div className="h-3 bg-gray-200 rounded animate-pulse"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (!data) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-center h-20 text-muted-foreground">
              Tidak ada data
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const cards = [
    {
      title: "Total Risiko",
      value: data.totalRisks,
      description: "Jumlah seluruh risiko",
      icon: Activity,
      trend: data.riskTrend,
      color: "text-blue-600"
    },
    {
      title: "Risiko Tinggi",
      value: data.highRisks,
      description: "Memerlukan perhatian khusus",
      icon: AlertTriangle,
      color: "text-red-600",
      badge: data.highRisks > 0 ? "danger" : "success"
    },
    {
      title: "Risiko Baru",
      value: data.newRisks,
      description: "Bulan ini",
      icon: TrendingUp,
      color: "text-yellow-600"
    },
    {
      title: "Compliance Score",
      value: `${data.complianceScore}%`,
      description: "Skor kepatuhan risiko",
      icon: Shield,
      color: data.complianceScore >= 80 ? "text-green-600" : data.complianceScore >= 60 ? "text-yellow-600" : "text-red-600"
    }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((card, index) => {
        const Icon = card.icon
        return (
          <Card key={index} className="relative overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {card.title}
              </CardTitle>
              <Icon className={`h-4 w-4 ${card.color}`} />
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2">
                <div className="text-2xl font-bold">{card.value}</div>
                {card.trend && (
                  <div className="flex items-center">
                    {card.trend === 'up' && (
                      <TrendingUp className="h-4 w-4 text-red-500" />
                    )}
                    {card.trend === 'down' && (
                      <TrendingDown className="h-4 w-4 text-green-500" />
                    )}
                  </div>
                )}
                {card.badge && (
                  <Badge 
                    variant={card.badge === 'danger' ? 'destructive' : 'default'}
                    className="text-xs"
                  >
                    {card.badge === 'danger' ? 'Critical' : 'OK'}
                  </Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                {card.description}
              </p>
            </CardContent>
            
            {/* Progress bar for compliance score */}
            {card.title === "Compliance Score" && (
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-200">
                <div 
                  className={`h-full transition-all duration-300 ${
                    data.complianceScore >= 80 ? 'bg-green-500' : 
                    data.complianceScore >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${data.complianceScore}%` }}
                />
              </div>
            )}
          </Card>
        )
      })}
    </div>
  )
}

// Export individual risk card for reuse
export function RiskCard({ 
  title, 
  value, 
  description, 
  icon: Icon, 
  color = "text-gray-600",
  trend,
  isLoading = false 
}: {
  title: string
  value: string | number
  description: string
  icon: React.ElementType
  color?: string
  trend?: 'up' | 'down' | 'stable'
  isLoading?: boolean
}) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            <div className="h-4 bg-gray-200 rounded animate-pulse w-20"></div>
          </CardTitle>
          <div className="h-4 w-4 bg-gray-200 rounded animate-pulse"></div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            <div className="h-8 bg-gray-200 rounded animate-pulse w-16"></div>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            <div className="h-3 bg-gray-200 rounded animate-pulse w-24"></div>
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">
          {title}
        </CardTitle>
        <Icon className={`h-4 w-4 ${color}`} />
      </CardHeader>
      <CardContent>
        <div className="flex items-center space-x-2">
          <div className="text-2xl font-bold">{value}</div>
          {trend && (
            <div className="flex items-center">
              {trend === 'up' && (
                <TrendingUp className="h-4 w-4 text-red-500" />
              )}
              {trend === 'down' && (
                <TrendingDown className="h-4 w-4 text-green-500" />
              )}
            </div>
          )}
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          {description}
        </p>
      </CardContent>
    </Card>
  )
}