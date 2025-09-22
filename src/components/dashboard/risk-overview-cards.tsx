import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, TrendingDown, AlertTriangle, Shield, Activity, Clock } from "lucide-react"

interface RiskOverviewCardsProps {
  stats: {
    overview: {
      totalRisks: number
      pendingAssessments: number
      activeRisks: number
    }
    trends: {
      newRisksThisMonth: number
    }
  }
}

export function RiskOverviewCards({ stats }: RiskOverviewCardsProps) {
  const cards = [
    {
      title: "Total Risiko",
      value: stats.overview.totalRisks,
      description: "Jumlah risiko terdaftar",
      icon: Shield,
      trend: stats.trends.newRisksThisMonth,
      trendLabel: "baru bulan ini",
      color: "blue"
    },
    {
      title: "Risiko Aktif",
      value: stats.overview.activeRisks,
      description: "Risiko yang sedang dipantau",
      icon: Activity,
      trend: null,
      trendLabel: "",
      color: "green"
    },
    {
      title: "Pending Assessment",
      value: stats.overview.pendingAssessments,
      description: "Risiko belum dinilai",
      icon: Clock,
      trend: null,
      trendLabel: "",
      color: "yellow"
    }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {cards.map((card, index) => {
        const IconComponent = card.icon
        const isPositiveTrend = card.trend !== null && card.trend > 0
        const TrendIcon = isPositiveTrend ? TrendingUp : TrendingDown
        
        return (
          <Card key={index} className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {card.title}
              </CardTitle>
              <IconComponent className={`h-4 w-4 text-${card.color}-600`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{card.value}</div>
              <p className="text-xs text-muted-foreground">
                {card.description}
              </p>
              {card.trend !== null && (
                <div className="flex items-center space-x-1 mt-2">
                  <TrendIcon className={`h-3 w-3 ${isPositiveTrend ? 'text-green-600' : 'text-red-600'}`} />
                  <span className={`text-xs ${isPositiveTrend ? 'text-green-600' : 'text-red-600'}`}>
                    {card.trend} {card.trendLabel}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}