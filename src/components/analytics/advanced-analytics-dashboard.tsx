"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts"
import { 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  Shield, 
  Target,
  Activity,
  FileBarChart,
  Download,
  Loader2
} from "lucide-react"
import { toast } from "sonner"

interface AnalyticsData {
  trendData: Array<{
    period: string
    totalRisks: number
    highRisks: number
    treatmentPlans: number
    overdueTreatments: number
    kriAlerts: number
    complianceScore: number
  }>
  riskLevelDistribution: Array<{
    level: string
    count: number
  }>
  riskByCategory: Array<{
    categoryId: number
    categoryName: string
    count: number
  }>
  recentLossEvents: Array<{
    id: number
    name: string
    date: string
    loss: number | null
    category: string | null
  }>
  kriPerformance: Array<{
    id: number
    name: string
    threshold: number | null
    unit: string
    riskName: string
    ownerUnit: string
  }>
  treatmentEffectiveness: Array<{
    id: number
    riskName: string
    plan: string
    cost: number | null
    timeline: number | null
    progress: string | null
  }>
}

// Color scheme for charts
const COLORS = {
  VERY_HIGH: '#dc2626',
  HIGH: '#ea580c',
  MODERATE: '#ca8a04',
  LOW: '#16a34a',
  VERY_LOW: '#0891b2'
}

const CHART_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4']

export function AdvancedAnalyticsDashboard() {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [selectedUnit, setSelectedUnit] = useState<string>("all")
  const [timeRange, setTimeRange] = useState<string>("6")

  useEffect(() => {
    loadAnalyticsData()
  }, [selectedUnit, timeRange])

  const loadAnalyticsData = async () => {
    try {
      setIsLoading(true)
      const params = new URLSearchParams({
        months: timeRange,
        ...(selectedUnit !== "all" && { unitId: selectedUnit })
      })

      const response = await fetch(`/api/analytics/dashboard?${params}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch analytics data')
      }

      const analyticsData = await response.json()
      setData(analyticsData)
    } catch (error) {
      console.error('Error loading analytics:', error)
      toast.error('Failed to load analytics data')
    } finally {
      setIsLoading(false)
    }
  }

  const downloadReport = async (type: string) => {
    try {
      toast.info('Generating report...')
      // Implement PDF report generation
      // This would call a separate API endpoint
      const params = new URLSearchParams({
        type,
        unitId: selectedUnit,
        months: timeRange
      })
      
      const response = await fetch(`/api/analytics/reports?${params}`)
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `risk-analytics-${type}-${new Date().toISOString().split('T')[0]}.pdf`
        a.click()
        toast.success('Report downloaded successfully')
      }
    } catch (error) {
      toast.error('Failed to generate report')
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        <span className="ml-2">Loading analytics data...</span>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No analytics data available</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="3">Last 3 Months</SelectItem>
              <SelectItem value="6">Last 6 Months</SelectItem>
              <SelectItem value="12">Last 12 Months</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={selectedUnit} onValueChange={setSelectedUnit}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Select Unit" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Units</SelectItem>
              {/* Add unit options dynamically */}
            </SelectContent>
          </Select>
        </div>

        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => downloadReport('summary')}
          >
            <Download className="w-4 h-4 mr-2" />
            Download Report
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={loadAnalyticsData}
          >
            Refresh
          </Button>
        </div>
      </div>

      {/* Analytics Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="trends">Risk Trends</TabsTrigger>
          <TabsTrigger value="performance">KRI Performance</TabsTrigger>
          <TabsTrigger value="treatments">Treatment Analysis</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Risks</CardTitle>
                <Shield className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {data.trendData[data.trendData.length - 1]?.totalRisks || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  Across all units
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">High Risk Items</CardTitle>
                <AlertTriangle className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  {data.trendData[data.trendData.length - 1]?.highRisks || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  Requiring immediate attention
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Treatments</CardTitle>
                <Target className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {data.trendData[data.trendData.length - 1]?.treatmentPlans || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  Treatment plans in progress
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Compliance Score</CardTitle>
                <Activity className="h-4 w-4 text-purple-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {data.trendData[data.trendData.length - 1]?.complianceScore || 0}%
                </div>
                <p className="text-xs text-muted-foreground">
                  Overall compliance rating
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Risk Distribution Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Risk Level Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Risk Level Distribution</CardTitle>
                <CardDescription>
                  Current risk distribution by severity level
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={data.riskLevelDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({level, count}) => `${level}: ${count}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="count"
                    >
                      {data.riskLevelDistribution.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={COLORS[entry.level as keyof typeof COLORS] || CHART_COLORS[index % CHART_COLORS.length]} 
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Risk by Category */}
            <Card>
              <CardHeader>
                <CardTitle>Risk by Category</CardTitle>
                <CardDescription>
                  Risk distribution across different categories
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={data.riskByCategory}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="categoryName" 
                      angle={-45}
                      textAnchor="end"
                      height={100}
                    />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Risk Trends Tab */}
        <TabsContent value="trends" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Risk Trend Analysis</CardTitle>
              <CardDescription>
                Historical trend of risk metrics over time
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={data.trendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="period" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="totalRisks" 
                    stroke="#3b82f6" 
                    strokeWidth={2}
                    name="Total Risks"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="highRisks" 
                    stroke="#ef4444" 
                    strokeWidth={2}
                    name="High Risks"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="complianceScore" 
                    stroke="#10b981" 
                    strokeWidth={2}
                    name="Compliance Score"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* KRI Performance Tab */}
        <TabsContent value="performance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Key Risk Indicators</CardTitle>
              <CardDescription>
                Current status and performance of KRIs
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {data.kriPerformance.map((kri) => (
                  <div key={kri.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium">{kri.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {kri.riskName} - {kri.ownerUnit}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium">
                          Threshold: {kri.threshold || 'Not Set'} {kri.unit}
                        </div>
                        <Badge variant={kri.threshold ? "default" : "secondary"}>
                          {kri.threshold ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Treatment Analysis Tab */}
        <TabsContent value="treatments" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Treatment Effectiveness</CardTitle>
              <CardDescription>
                Analysis of risk treatment plan performance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {data.treatmentEffectiveness.map((treatment) => (
                  <div key={treatment.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h4 className="font-medium">{treatment.riskName}</h4>
                        <p className="text-sm text-muted-foreground mb-2">
                          {treatment.plan}
                        </p>
                        <div className="flex items-center space-x-4 text-sm">
                          {treatment.cost && (
                            <span>Cost: Rp {treatment.cost.toLocaleString()}</span>
                          )}
                          {treatment.timeline && (
                            <span>Timeline: {treatment.timeline} months</span>
                          )}
                        </div>
                      </div>
                      <Badge 
                        variant={
                          treatment.progress === "Completed" ? "default" :
                          treatment.progress === "In Progress" ? "secondary" : "outline"
                        }
                      >
                        {treatment.progress || "Not Started"}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}