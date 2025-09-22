import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { AlertTriangle, Clock, TrendingUp } from "lucide-react"
import Link from "next/link"

interface KRIAlertsProps {
  stats: {
    overview: {
      pendingAssessments: number
    }
    recentRisks: Array<{
      id: number
      namaRisiko: string
      createdAt: string
      kategori: {
        categoryBUMN: string
      }
    }>
  }
}

export function KRIAlerts({ stats }: KRIAlertsProps) {
  const alerts = []

  // Add alerts based on KRI thresholds
  if (stats.overview.pendingAssessments > 5) {
    alerts.push({
      type: "warning", 
      icon: Clock,
      title: "Banyak Assessment Tertunda",
      description: `${stats.overview.pendingAssessments} risiko belum dinilai`,
      action: "Lihat Assessment",
      href: "/risks?filter=pending-assessment"
    })
  }

  if (stats.recentRisks.length > 3) {
    alerts.push({
      type: "info",
      icon: TrendingUp,
      title: "Aktivitas Risiko Tinggi",
      description: `${stats.recentRisks.length} risiko baru ditambahkan`,
      action: "Lihat Aktivitas",
      href: "/risks"
    })
  }

  const getAlertColor = (type: string) => {
    switch (type) {
      case "critical":
        return "border-red-200 bg-red-50 text-red-800"
      case "warning":
        return "border-yellow-200 bg-yellow-50 text-yellow-800"
      case "info":
        return "border-blue-200 bg-blue-50 text-blue-800"
      default:
        return "border-gray-200 bg-gray-50 text-gray-800"
    }
  }

  return (
    <div className="space-y-6">
      {/* KRI Alerts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5 text-amber-600" />
            <span>Key Risk Indicators (KRI)</span>
          </CardTitle>
          <CardDescription>
            Peringatan berdasarkan indikator risiko kunci
          </CardDescription>
        </CardHeader>
        <CardContent>
          {alerts.length > 0 ? (
            <div className="space-y-3">
              {alerts.map((alert, index) => {
                const IconComponent = alert.icon
                return (
                  <div 
                    key={index}
                    className={`p-4 rounded-lg border ${getAlertColor(alert.type)}`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3">
                        <IconComponent className="h-5 w-5 mt-0.5" />
                        <div>
                          <h4 className="font-medium">{alert.title}</h4>
                          <p className="text-sm opacity-90 mt-1">
                            {alert.description}
                          </p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm" asChild>
                        <Link href={alert.href}>
                          {alert.action}
                        </Link>
                      </Button>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <AlertTriangle className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Tidak ada peringatan KRI saat ini</p>
              <p className="text-sm">Semua indikator dalam batas normal</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Aktivitas Terbaru</CardTitle>
          <CardDescription>
            Risiko yang baru saja ditambahkan
          </CardDescription>
        </CardHeader>
        <CardContent>
          {stats.recentRisks.length > 0 ? (
            <div className="space-y-3">
              {stats.recentRisks.slice(0, 5).map((risk) => (
                <div key={risk.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <Link 
                        href={`/risks/${risk.id}`}
                        className="font-medium hover:text-blue-600 transition-colors"
                      >
                        {risk.namaRisiko}
                      </Link>
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">
                      {risk.kategori.categoryBUMN}
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {new Date(risk.createdAt).toLocaleDateString('id-ID')}
                  </div>
                </div>
              ))}
              <div className="pt-3 border-t">
                <Button variant="outline" className="w-full" asChild>
                  <Link href="/risks">
                    Lihat Semua Risiko
                  </Link>
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Belum ada aktivitas terbaru</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}