import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface RiskMatrixHeatmapProps {
  distribution: Array<{
    level: string
    count: number
    percentage: number
  }>
}

export function RiskMatrixHeatmap({ distribution }: RiskMatrixHeatmapProps) {
  const getRiskLevelColor = (level: string) => {
    switch (level) {
      case "VERY_HIGH":
        return "bg-red-600 text-white"
      case "HIGH":
        return "bg-red-400 text-white"
      case "MODERATE":
        return "bg-yellow-400 text-black"
      case "LOW":
        return "bg-green-400 text-black"
      case "VERY_LOW":
        return "bg-green-600 text-white"
      default:
        return "bg-gray-400 text-white"
    }
  }

  const getRiskLevelText = (level: string) => {
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

  // Sort by risk level priority
  const levelOrder = ["VERY_HIGH", "HIGH", "MODERATE", "LOW", "VERY_LOW"]
  const sortedDistribution = distribution.sort((a, b) => 
    levelOrder.indexOf(a.level) - levelOrder.indexOf(b.level)
  )

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <span>Distribusi Tingkat Risiko</span>
        </CardTitle>
        <CardDescription>
          Sebaran risiko berdasarkan tingkat keparahan
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {sortedDistribution.map((item) => (
            <div key={item.level} className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Badge className={`${getRiskLevelColor(item.level)} min-w-[120px] justify-center`}>
                  {getRiskLevelText(item.level)}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  {item.count} risiko
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-20 bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${getRiskLevelColor(item.level).split(' ')[0]}`}
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>
                <span className="text-sm font-medium min-w-[40px]">
                  {item.percentage}%
                </span>
              </div>
            </div>
          ))}
        </div>
        
        {sortedDistribution.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            Belum ada data distribusi risiko
          </div>
        )}
      </CardContent>
    </Card>
  )
}