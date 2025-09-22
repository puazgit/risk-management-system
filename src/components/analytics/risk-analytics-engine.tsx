'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, ScatterChart, Scatter } from 'recharts'
import { TrendingUp, TrendingDown, AlertTriangle, Target, Activity, Brain, Zap, Users, Shield } from 'lucide-react'

interface RiskAnalyticsEngineProps {
  className?: string
}

interface HeatMapData {
  matrix: number[][]
  riskDetails: any[][][]
  summary: {
    totalRisks: number
    highRisk: number
    mediumRisk: number
    lowRisk: number
    categories: string[]
    avgRiskScore: number
    withControls: number
    withTreatments: number
  }
}

interface PredictiveData {
  historical: any[]
  prediction: {
    slope: number
    trend: string
    predictions: any[]
  }
  insights: any[]
  recommendations: any[]
}

interface BenchmarkData {
  organization: any
  industry: any
  comparison: any
  recommendations: any[]
}

interface DrillDownData {
  summary: {
    totalRisks: number
    distributions: {
      byCategory: any[]
      byOwner: any[]
      byLevel: any[]
    }
  }
  detailed: any[]
}

export default function RiskAnalyticsEngine({ className }: RiskAnalyticsEngineProps) {
  const [activeTab, setActiveTab] = useState('heatmap')
  const [period, setPeriod] = useState('3months')
  const [category, setCategory] = useState('all')
  const [loading, setLoading] = useState(false)
  
  const [heatMapData, setHeatMapData] = useState<HeatMapData | null>(null)
  const [predictiveData, setPredictiveData] = useState<PredictiveData | null>(null)
  const [benchmarkData, setBenchmarkData] = useState<BenchmarkData | null>(null)
  const [drillDownData, setDrillDownData] = useState<DrillDownData | null>(null)

  const fetchAnalyticsData = async (analysisType: string) => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        analysis: analysisType,
        period,
        ...(category !== 'all' && { category })
      })
      
      const response = await fetch(`/api/analytics/engine?${params}`)
      if (!response.ok) throw new Error('Failed to fetch analytics data')
      
      const data = await response.json()
      
      switch (analysisType) {
        case 'heatmap':
          setHeatMapData(data)
          break
        case 'predictive':
          setPredictiveData(data)
          break
        case 'benchmark':
          setBenchmarkData(data)
          break
        case 'drilldown':
          setDrillDownData(data)
          break
      }
    } catch (error) {
      console.error('Error fetching analytics data:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAnalyticsData(activeTab)
  }, [activeTab, period, category])

  const renderHeatMap = () => {
    if (!heatMapData) return <div>Loading heat map...</div>

    const { matrix, riskDetails, summary } = heatMapData
    const impactLabels = ['Very Low', 'Low', 'Medium', 'High', 'Very High']
    const probabilityLabels = ['Very Low', 'Low', 'Medium', 'High', 'Very High']

    const getHeatMapColor = (count: number) => {
      if (count === 0) return 'bg-gray-100'
      if (count <= 2) return 'bg-green-200'
      if (count <= 5) return 'bg-yellow-200'
      if (count <= 10) return 'bg-orange-200'
      return 'bg-red-200'
    }

    return (
      <div className="space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-red-600">{summary.highRisk}</div>
              <p className="text-xs text-muted-foreground">High Risk</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-yellow-600">{summary.mediumRisk}</div>
              <p className="text-xs text-muted-foreground">Medium Risk</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-green-600">{summary.lowRisk}</div>
              <p className="text-xs text-muted-foreground">Low Risk</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold">{summary.avgRiskScore.toFixed(1)}</div>
              <p className="text-xs text-muted-foreground">Avg Risk Score</p>
            </CardContent>
          </Card>
        </div>

        {/* Heat Map */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5" />
              Risk Heat Map
            </CardTitle>
            <CardDescription>
              Risk distribution based on probability vs impact analysis
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <div className="inline-block min-w-full">
                {/* Y-axis label */}
                <div className="flex items-center mb-4">
                  <div className="w-20 text-sm font-medium transform -rotate-90 origin-center">
                    Impact
                  </div>
                  <div className="ml-4">
                    {/* Heat map grid */}
                    <div className="grid grid-cols-5 gap-1 mb-2">
                      {matrix.map((row, rowIndex) =>
                        row.map((count, colIndex) => (
                          <div
                            key={`${rowIndex}-${colIndex}`}
                            className={`w-16 h-16 border border-gray-300 flex items-center justify-center text-sm font-medium cursor-pointer transition-all hover:scale-105 ${getHeatMapColor(count)}`}
                            title={`Impact: ${impactLabels[4 - rowIndex]}, Probability: ${probabilityLabels[colIndex]}, Risks: ${count}`}
                          >
                            {count > 0 ? count : ''}
                          </div>
                        ))
                      )}
                    </div>
                    {/* X-axis labels */}
                    <div className="grid grid-cols-5 gap-1 text-xs text-center">
                      {probabilityLabels.map((label, index) => (
                        <div key={index} className="w-16">{label}</div>
                      ))}
                    </div>
                  </div>
                </div>
                {/* X-axis title */}
                <div className="text-center text-sm font-medium mt-2">Probability</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Risk Controls & Treatments */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Control Coverage
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm">
                    <span>Risks with Controls</span>
                    <span>{summary.withControls}/{summary.totalRisks}</span>
                  </div>
                  <Progress value={(summary.withControls / summary.totalRisks) * 100} className="mt-2" />
                </div>
                <div>
                  <div className="flex justify-between text-sm">
                    <span>Risks with Treatments</span>
                    <span>{summary.withTreatments}/{summary.totalRisks}</span>
                  </div>
                  <Progress value={(summary.withTreatments / summary.totalRisks) * 100} className="mt-2" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5" />
                Risk Categories
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {summary.categories.slice(0, 5).map((cat, index) => (
                  <Badge key={index} variant="secondary" className="mr-2 mb-2">
                    {cat}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  const renderPredictive = () => {
    if (!predictiveData) return <div>Loading predictive analytics...</div>

    const { historical, prediction, insights, recommendations } = predictiveData

    const getTrendIcon = (trend: string) => {
      switch (trend) {
        case 'increasing': return <TrendingUp className="w-4 h-4 text-red-500" />
        case 'decreasing': return <TrendingDown className="w-4 h-4 text-green-500" />
        default: return <Activity className="w-4 h-4 text-blue-500" />
      }
    }

    const getTrendColor = (trend: string) => {
      switch (trend) {
        case 'increasing': return 'text-red-600'
        case 'decreasing': return 'text-green-600'
        default: return 'text-blue-600'
      }
    }

    return (
      <div className="space-y-6">
        {/* Trend Summary */}
        {prediction && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="w-5 h-5" />
                Risk Trend Prediction
              </CardTitle>
              <CardDescription>
                AI-powered risk trend analysis and forecasting
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center gap-2">
                  {getTrendIcon(prediction.trend)}
                  <span className={`font-medium ${getTrendColor(prediction.trend)}`}>
                    Trend: {prediction.trend.charAt(0).toUpperCase() + prediction.trend.slice(1)}
                  </span>
                </div>
                <Badge variant={prediction.trend === 'increasing' ? 'destructive' : prediction.trend === 'decreasing' ? 'default' : 'secondary'}>
                  Slope: {prediction.slope.toFixed(3)}
                </Badge>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Historical Trend Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Historical Risk Trends</CardTitle>
            <CardDescription>
              Risk metrics over time with predictive forecasting
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={[...historical, ...(prediction?.predictions || [])]}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="avgRiskScore" 
                  stroke="#8884d8" 
                  strokeWidth={2}
                  name="Historical Avg Risk Score"
                />
                <Line 
                  type="monotone" 
                  dataKey="predictedRiskScore" 
                  stroke="#ff7300" 
                  strokeDasharray="5 5"
                  strokeWidth={2}
                  name="Predicted Risk Score"
                />
                <Line 
                  type="monotone" 
                  dataKey="highRiskCount" 
                  stroke="#dc2626" 
                  strokeWidth={2}
                  name="High Risk Count"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Insights */}
        {insights.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5" />
                AI Insights
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {insights.map((insight, index) => (
                  <Alert key={index} className={insight.type === 'warning' ? 'border-yellow-500' : insight.type === 'alert' ? 'border-red-500' : 'border-blue-500'}>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>
                      {insight.type.charAt(0).toUpperCase() + insight.type.slice(1)} - {insight.impact} Impact
                    </AlertTitle>
                    <AlertDescription>
                      {insight.message}
                    </AlertDescription>
                  </Alert>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Recommendations */}
        {recommendations.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5" />
                AI Recommendations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recommendations.map((rec, index) => (
                  <div key={index} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant={rec.priority === 'high' ? 'destructive' : 'secondary'}>
                        {rec.priority.toUpperCase()} PRIORITY
                      </Badge>
                    </div>
                    <h4 className="font-medium">{rec.action}</h4>
                    <p className="text-sm text-muted-foreground mt-1">{rec.reason}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    )
  }

  const renderBenchmark = () => {
    if (!benchmarkData) return <div>Loading benchmark analysis...</div>

    const { organization, industry, comparison, recommendations } = benchmarkData

    const getPerformanceColor = (performance: string) => {
      return performance === 'better' ? 'text-green-600' : 'text-red-600'
    }

    const getPerformanceIcon = (performance: string) => {
      return performance === 'better' ? 
        <TrendingUp className="w-4 h-4 text-green-500" /> : 
        <TrendingDown className="w-4 h-4 text-red-500" />
    }

    return (
      <div className="space-y-6">
        {/* Benchmark Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Organization Performance</CardTitle>
              <CardDescription>Current risk management metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span>Average Risk Score</span>
                  <span className="font-medium">{organization.avgRiskScore.toFixed(1)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Risk Density</span>
                  <span className="font-medium">{(organization.riskDensity * 100).toFixed(1)}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Mitigation Rate</span>
                  <span className="font-medium">{(organization.mitigation * 100).toFixed(1)}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Response Time</span>
                  <span className="font-medium">{organization.responseTime} days</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Industry Benchmark</CardTitle>
              <CardDescription>BUMN industry standards</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span>Average Risk Score</span>
                  <span className="font-medium">{industry.avgRiskScore.toFixed(1)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Risk Density</span>
                  <span className="font-medium">{(industry.riskDensity * 100).toFixed(1)}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Mitigation Rate</span>
                  <span className="font-medium">{(industry.mitigation * 100).toFixed(1)}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Response Time</span>
                  <span className="font-medium">{industry.responseTime} days</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Performance Comparison */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Performance vs Industry
            </CardTitle>
            <CardDescription>
              Comparison with BUMN industry standards
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h4 className="font-medium">Risk Score Performance</h4>
                  <p className="text-sm text-muted-foreground">
                    Gap: {comparison.overall.riskScore.gap > 0 ? '+' : ''}{comparison.overall.riskScore.gap.toFixed(1)} points
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {getPerformanceIcon(comparison.overall.riskScore.performance)}
                  <Badge variant={comparison.overall.riskScore.performance === 'better' ? 'default' : 'destructive'}>
                    {comparison.overall.riskScore.performance.toUpperCase()}
                  </Badge>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h4 className="font-medium">Mitigation Performance</h4>
                  <p className="text-sm text-muted-foreground">
                    Gap: {comparison.overall.mitigation.gap > 0 ? '+' : ''}{(comparison.overall.mitigation.gap * 100).toFixed(1)}%
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {getPerformanceIcon(comparison.overall.mitigation.performance)}
                  <Badge variant={comparison.overall.mitigation.performance === 'better' ? 'default' : 'destructive'}>
                    {comparison.overall.mitigation.performance.toUpperCase()}
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Category Comparison */}
        {Object.keys(comparison.categories).length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Category Performance</CardTitle>
              <CardDescription>
                Performance by risk category
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Object.entries(comparison.categories).map(([category, data]: [string, any]) => (
                  <div key={category} className="flex items-center justify-between p-3 border rounded">
                    <span className="font-medium">{category}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm">
                        {data.avgScore.org.toFixed(1)} vs {data.avgScore.industry.toFixed(1)}
                      </span>
                      {getPerformanceIcon(data.avgScore.performance)}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Recommendations */}
        {recommendations.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5" />
                Improvement Recommendations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recommendations.map((rec, index) => (
                  <div key={index} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant={rec.priority === 'high' ? 'destructive' : 'secondary'}>
                        {rec.priority.toUpperCase()} PRIORITY
                      </Badge>
                    </div>
                    <h4 className="font-medium">{rec.action}</h4>
                    <p className="text-sm text-muted-foreground mt-1">{rec.reason}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    )
  }

  const renderDrillDown = () => {
    if (!drillDownData) return <div>Loading drill-down analysis...</div>

    const { summary, detailed } = drillDownData

    return (
      <div className="space-y-6">
        {/* Summary Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>By Category</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={summary.distributions.byCategory}
                    cx="50%"
                    cy="50%"
                    outerRadius={60}
                    fill="#8884d8"
                    dataKey="count"
                    label={({ name, count }) => `${name}: ${count}`}
                  >
                    {summary.distributions.byCategory.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={`hsl(${index * 45}, 70%, 60%)`} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>By Risk Level</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={summary.distributions.byLevel}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>By Owner</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {summary.distributions.byOwner.slice(0, 5).map((owner, index) => (
                  <div key={index} className="flex justify-between items-center">
                    <span className="text-sm">{owner.name}</span>
                    <Badge variant="secondary">{owner.count}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Risk List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Detailed Risk Analysis
            </CardTitle>
            <CardDescription>
              Comprehensive view of all risks with key metrics
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">Risk Name</th>
                    <th className="text-left p-2">Category</th>
                    <th className="text-left p-2">Owner</th>
                    <th className="text-left p-2">Level</th>
                    <th className="text-left p-2">Score</th>
                    <th className="text-left p-2">Controls</th>
                    <th className="text-left p-2">Treatments</th>
                    <th className="text-left p-2">KRIs</th>
                  </tr>
                </thead>
                <tbody>
                  {detailed.slice(0, 20).map((risk, index) => (
                    <tr key={index} className="border-b hover:bg-gray-50">
                      <td className="p-2">{risk.namaRisiko}</td>
                      <td className="p-2">{risk.category}</td>
                      <td className="p-2">{risk.owner}</td>
                      <td className="p-2">
                        <Badge variant={
                          risk.level === 'High' ? 'destructive' : 
                          risk.level === 'Moderate' ? 'default' : 'secondary'
                        }>
                          {risk.level}
                        </Badge>
                      </td>
                      <td className="p-2">{risk.riskScore.toFixed(1)}</td>
                      <td className="p-2">{risk.controlCount}</td>
                      <td className="p-2">{risk.treatmentCount}</td>
                      <td className="p-2">{risk.kriCount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className={className}>
      <div className="flex flex-col space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Risk Analytics Engine</h1>
            <p className="text-gray-600 mt-1">
              Advanced risk analytics with AI-powered insights and predictive modeling
            </p>
          </div>
          
          <div className="flex flex-col md:flex-row gap-4">
            <Select value={period} onValueChange={setPeriod}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Select period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1month">Last Month</SelectItem>
                <SelectItem value="3months">Last 3 Months</SelectItem>
                <SelectItem value="6months">Last 6 Months</SelectItem>
                <SelectItem value="1year">Last Year</SelectItem>
              </SelectContent>
            </Select>

            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="Risiko Operasional">Risiko Operasional</SelectItem>
                <SelectItem value="Risiko Keuangan">Risiko Keuangan</SelectItem>
                <SelectItem value="Risiko Strategis">Risiko Strategis</SelectItem>
                <SelectItem value="Risiko Kepatuhan">Risiko Kepatuhan</SelectItem>
                <SelectItem value="Risiko Teknologi">Risiko Teknologi</SelectItem>
              </SelectContent>
            </Select>

            <Button onClick={() => fetchAnalyticsData(activeTab)} disabled={loading}>
              {loading ? 'Loading...' : 'Refresh'}
            </Button>
          </div>
        </div>

        {/* Analytics Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="heatmap" className="flex items-center gap-2">
              <Target className="w-4 h-4" />
              Heat Map
            </TabsTrigger>
            <TabsTrigger value="predictive" className="flex items-center gap-2">
              <Brain className="w-4 h-4" />
              Predictive
            </TabsTrigger>
            <TabsTrigger value="benchmark" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Benchmark
            </TabsTrigger>
            <TabsTrigger value="drilldown" className="flex items-center gap-2">
              <Activity className="w-4 h-4" />
              Drill-down
            </TabsTrigger>
          </TabsList>

          <TabsContent value="heatmap" className="space-y-6">
            {renderHeatMap()}
          </TabsContent>

          <TabsContent value="predictive" className="space-y-6">
            {renderPredictive()}
          </TabsContent>

          <TabsContent value="benchmark" className="space-y-6">
            {renderBenchmark()}
          </TabsContent>

          <TabsContent value="drilldown" className="space-y-6">
            {renderDrillDown()}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}