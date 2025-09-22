import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { subMonths, format } from 'date-fns'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const analysis = searchParams.get('analysis') || 'heatmap'
    const period = searchParams.get('period') || '3months'
    const category = searchParams.get('category')

    switch (analysis) {
      case 'heatmap':
        return NextResponse.json(await getHeatMapData(period, category))
      case 'predictive':
        return NextResponse.json(await getPredictiveData(period, category))
      case 'benchmark':
        return NextResponse.json(await getBenchmarkData())
      case 'drilldown':
        return NextResponse.json(await getDrillDownData(period, category))
      default:
        return NextResponse.json(await getHeatMapData(period, category))
    }
  } catch (error) {
    console.error('Error in analytics engine:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}

async function getHeatMapData(period: string, category?: string | null) {
  const periodDate = getPeriodDate(period)
  
  const whereClause: any = {
    createdAt: { gte: periodDate },
    ...(category && { kategori: { categoryBUMN: category } })
  }

  // Get risk data with inherent and residual assessments
  const risks = await prisma.risiko.findMany({
    where: whereClause,
    include: {
      kategori: true,
      ownerUnit: true,
      risikoInheren: true,
      risikoResidual: true,
      kontrolExisting: true,
      perlakuanRisiko: true
    }
  })

  // Transform data for heat map
  const heatMapData = risks.map(risk => {
    const inherentScore = risk.risikoInheren?.inherenExposure || 5
    const residualScore = risk.risikoResidual?.residualExposure || inherentScore
    
    // Calculate probability and impact from exposure (assuming exposure = prob * impact)
    const probability = Math.sqrt(residualScore)
    const impact = Math.sqrt(residualScore)
    
    return {
      id: risk.id,
      title: risk.namaRisiko,
      category: risk.kategori?.categoryBUMN || 'Uncategorized',
      probability: Math.min(5, Math.max(1, Math.round(probability))),
      impact: Math.min(5, Math.max(1, Math.round(impact))),
      riskScore: residualScore,
      level: risk.risikoResidual?.residualLevel || risk.risikoInheren?.inherenLevel || 'Low',
      owner: risk.ownerUnit?.name || 'Unassigned',
      hasControls: risk.kontrolExisting.length > 0,
      hasTreatments: risk.perlakuanRisiko.length > 0
    }
  })

  // Create heat map matrix (5x5 grid)
  const matrix = Array(5).fill(null).map(() => Array(5).fill(0))
  const riskDetails: any[][][] = Array(5).fill(null).map(() => Array(5).fill(null).map(() => []))

  heatMapData.forEach(risk => {
    const probIndex = Math.min(4, Math.max(0, risk.probability - 1))
    const impactIndex = Math.min(4, Math.max(0, risk.impact - 1))
    
    matrix[probIndex][impactIndex]++
    riskDetails[probIndex][impactIndex].push(risk)
  })

  return {
    matrix,
    riskDetails,
    summary: {
      totalRisks: heatMapData.length,
      highRisk: heatMapData.filter(r => r.level === 'High').length,
      mediumRisk: heatMapData.filter(r => r.level === 'Moderate').length,
      lowRisk: heatMapData.filter(r => r.level === 'Low').length,
      categories: [...new Set(heatMapData.map(r => r.category))],
      avgRiskScore: heatMapData.reduce((sum: number, r) => sum + r.riskScore, 0) / heatMapData.length || 0,
      withControls: heatMapData.filter(r => r.hasControls).length,
      withTreatments: heatMapData.filter(r => r.hasTreatments).length
    }
  }
}

async function getPredictiveData(period: string, category?: string | null) {
  const periodDate = getPeriodDate(period)
  
  const whereClause: any = {
    createdAt: { gte: subMonths(periodDate, 6) }, // Get 6 months of historical data
    ...(category && { kategori: { categoryBUMN: category } })
  }

  // Get historical risk data
  const historicalData = await prisma.risiko.findMany({
    where: whereClause,
    include: {
      kategori: true,
      risikoInheren: true,
      risikoResidual: true
    },
    orderBy: { createdAt: 'asc' }
  })

  // Group by month for trend analysis
  const monthlyData = new Map()
  
  historicalData.forEach(risk => {
    const month = format(risk.createdAt, 'yyyy-MM')
    if (!monthlyData.has(month)) {
      monthlyData.set(month, {
        month,
        totalRisks: 0,
        avgRiskScore: 0,
        highRiskCount: 0,
        newRisks: 0
      })
    }
    
    const monthData = monthlyData.get(month)
    const riskScore = risk.risikoResidual?.residualExposure || risk.risikoInheren?.inherenExposure || 5
    
    monthData.totalRisks++
    monthData.avgRiskScore += riskScore
    monthData.newRisks++
    if (risk.risikoResidual?.residualLevel === 'High' || risk.risikoInheren?.inherenLevel === 'High') {
      monthData.highRiskCount++
    }
  })

  // Calculate averages and create trend data
  const trendData = Array.from(monthlyData.values()).map((data: any) => ({
    ...data,
    avgRiskScore: data.avgRiskScore / data.totalRisks || 0
  }))

  // Simple linear regression for prediction
  const prediction = calculatePrediction(trendData)

  return {
    historical: trendData,
    prediction,
    insights: generateInsights(trendData),
    recommendations: generateRecommendations(trendData)
  }
}

async function getBenchmarkData() {
  // Industry benchmarks for Indonesian BUMN
  const industryBenchmarks = {
    avgRiskScore: 8.5,
    riskDensity: 0.15, // risks per unit
    mitigation: 0.75, // 75% mitigation rate
    responseTime: 14, // days to respond
    categories: {
      'Risiko Operasional': { avgScore: 7.2, frequency: 0.3 },
      'Risiko Keuangan': { avgScore: 9.1, frequency: 0.25 },
      'Risiko Strategis': { avgScore: 8.8, frequency: 0.2 },
      'Risiko Kepatuhan': { avgScore: 6.5, frequency: 0.15 },
      'Risiko Teknologi': { avgScore: 7.8, frequency: 0.1 }
    }
  }

  // Get current organization data
  const risks = await prisma.risiko.findMany({
    include: {
      kategori: true,
      risikoInheren: true,
      risikoResidual: true,
      perlakuanRisiko: true,
      kontrolExisting: true
    }
  })

  const orgData = {
    avgRiskScore: risks.reduce((sum: number, r) => {
      return sum + (r.risikoResidual?.residualExposure || r.risikoInheren?.inherenExposure || 5)
    }, 0) / risks.length || 0,
    riskDensity: risks.length / 10, // Assuming 10 units
    mitigation: risks.filter(r => r.perlakuanRisiko.length > 0).length / risks.length || 0,
    responseTime: 10, // Would calculate from actual response times
    categories: {} as any
  }

  // Calculate category-specific metrics
  const categoryStats: Record<string, { scores: number[], count: number }> = {}
  
  risks.forEach(risk => {
    const catName = risk.kategori?.categoryBUMN || 'Other'
    if (!categoryStats[catName]) {
      categoryStats[catName] = { scores: [], count: 0 }
    }
    const score = risk.risikoResidual?.residualExposure || risk.risikoInheren?.inherenExposure || 5
    categoryStats[catName].scores.push(score)
    categoryStats[catName].count++
  })

  Object.entries(categoryStats).forEach(([cat, data]) => {
    orgData.categories[cat] = {
      avgScore: data.scores.reduce((sum: number, score: number) => sum + score, 0) / data.scores.length,
      frequency: data.count / risks.length
    }
  })

  // Compare with benchmarks
  const comparison = {
    overall: {
      riskScore: {
        org: orgData.avgRiskScore,
        industry: industryBenchmarks.avgRiskScore,
        performance: orgData.avgRiskScore <= industryBenchmarks.avgRiskScore ? 'better' : 'worse',
        gap: orgData.avgRiskScore - industryBenchmarks.avgRiskScore
      },
      mitigation: {
        org: orgData.mitigation,
        industry: industryBenchmarks.mitigation,
        performance: orgData.mitigation >= industryBenchmarks.mitigation ? 'better' : 'worse',
        gap: orgData.mitigation - industryBenchmarks.mitigation
      }
    },
    categories: {} as any
  }

  Object.keys(industryBenchmarks.categories).forEach((cat: string) => {
    if (orgData.categories[cat]) {
      comparison.categories[cat] = {
        avgScore: {
          org: orgData.categories[cat].avgScore,
          industry: (industryBenchmarks.categories as any)[cat].avgScore,
          performance: orgData.categories[cat].avgScore <= (industryBenchmarks.categories as any)[cat].avgScore ? 'better' : 'worse'
        }
      }
    }
  })

  return {
    organization: orgData,
    industry: industryBenchmarks,
    comparison,
    recommendations: generateBenchmarkRecommendations(comparison)
  }
}

async function getDrillDownData(period: string, category?: string | null) {
  const periodDate = getPeriodDate(period)
  
  const whereClause: any = {
    createdAt: { gte: periodDate },
    ...(category && { kategori: { categoryBUMN: category } })
  }

  // Get detailed risk data
  const risks = await prisma.risiko.findMany({
    where: whereClause,
    include: {
      kategori: true,
      ownerUnit: true,
      risikoInheren: true,
      risikoResidual: true,
      kontrolExisting: true,
      perlakuanRisiko: true,
      KRI: true
    }
  })

  // Group by various dimensions
  const byCategory = groupBy(risks, (r: any) => r.kategori?.categoryBUMN || 'Uncategorized')
  const byOwner = groupBy(risks, (r: any) => r.ownerUnit?.name || 'Unassigned')
  const byLevel = groupBy(risks, (r: any) => r.risikoResidual?.residualLevel || r.risikoInheren?.inherenLevel || 'Low')

  return {
    summary: {
      totalRisks: risks.length,
      distributions: {
        byCategory: Object.keys(byCategory).map(key => ({
          name: key,
          count: byCategory[key].length,
          avgScore: byCategory[key].reduce((sum: number, r: any) => {
            return sum + (r.risikoResidual?.residualExposure || r.risikoInheren?.inherenExposure || 5)
          }, 0) / byCategory[key].length || 0
        })),
        byOwner: Object.keys(byOwner).map(key => ({
          name: key,
          count: byOwner[key].length
        })),
        byLevel: Object.keys(byLevel).map(key => ({
          name: key,
          count: byLevel[key].length
        }))
      }
    },
    detailed: risks.map((risk: any) => ({
      id: risk.id,
      namaRisiko: risk.namaRisiko,
      category: risk.kategori?.categoryBUMN,
      owner: risk.ownerUnit?.name,
      level: risk.risikoResidual?.residualLevel || risk.risikoInheren?.inherenLevel,
      riskScore: risk.risikoResidual?.residualExposure || risk.risikoInheren?.inherenExposure || 5,
      controlCount: risk.kontrolExisting.length,
      treatmentCount: risk.perlakuanRisiko.length,
      kriCount: risk.KRI.length,
      createdAt: risk.createdAt
    }))
  }
}

// Helper functions
function getPeriodDate(period: string): Date {
  const now = new Date()
  switch (period) {
    case '1month': return subMonths(now, 1)
    case '3months': return subMonths(now, 3)
    case '6months': return subMonths(now, 6)
    case '1year': return subMonths(now, 12)
    default: return subMonths(now, 3)
  }
}

function groupBy<T>(array: T[], keyFunc: (item: T) => string): Record<string, T[]> {
  return array.reduce((result, item) => {
    const key = keyFunc(item)
    if (!result[key]) result[key] = []
    result[key].push(item)
    return result
  }, {} as Record<string, T[]>)
}

function calculatePrediction(trendData: any[]) {
  if (trendData.length < 2) return null
  
  // Simple linear regression
  const n = trendData.length
  const xMean = (n - 1) / 2
  const yMean = trendData.reduce((sum, d) => sum + d.avgRiskScore, 0) / n
  
  let numerator = 0
  let denominator = 0
  
  trendData.forEach((data, i) => {
    const x = i - xMean
    const y = data.avgRiskScore - yMean
    numerator += x * y
    denominator += x * x
  })
  
  const slope = denominator !== 0 ? numerator / denominator : 0
  const intercept = yMean - slope * xMean
  
  // Predict next 3 months
  const predictions = []
  for (let i = 1; i <= 3; i++) {
    const x = n + i - 1
    const predictedValue = slope * x + intercept
    predictions.push({
      month: format(new Date(2024, new Date().getMonth() + i, 1), 'yyyy-MM'),
      predictedRiskScore: Math.max(0, predictedValue),
      confidence: Math.max(0.5, 1 - Math.abs(slope) * 0.1)
    })
  }
  
  return {
    slope,
    trend: slope > 0.1 ? 'increasing' : slope < -0.1 ? 'decreasing' : 'stable',
    predictions
  }
}

function generateInsights(trendData: any[]) {
  const insights = []
  
  if (trendData.length >= 2) {
    const recent = trendData[trendData.length - 1]
    const previous = trendData[trendData.length - 2]
    
    if (recent.avgRiskScore > previous.avgRiskScore * 1.1) {
      insights.push({
        type: 'warning',
        message: 'Risk scores have increased significantly in the last month',
        impact: 'high'
      })
    }
    
    if (recent.highRiskCount > previous.highRiskCount) {
      insights.push({
        type: 'alert',
        message: 'Number of high-risk items has increased',
        impact: 'high'
      })
    }
    
    if (recent.newRisks > recent.totalRisks * 0.8) {
      insights.push({
        type: 'info',
        message: 'Many new risks identified recently',
        impact: 'medium'
      })
    }
  }
  
  return insights
}

function generateRecommendations(trendData: any[]) {
  const recommendations = []
  
  if (trendData.length > 0) {
    const recent = trendData[trendData.length - 1]
    
    if (recent.avgRiskScore > 10) {
      recommendations.push({
        priority: 'high',
        action: 'Review and update risk mitigation strategies',
        reason: 'Overall risk scores are above acceptable threshold'
      })
    }
    
    if (recent.highRiskCount > 5) {
      recommendations.push({
        priority: 'high',
        action: 'Focus on high-risk items treatment',
        reason: 'Too many high-risk items require immediate attention'
      })
    }
    
    recommendations.push({
      priority: 'medium',
      action: 'Implement regular risk assessment schedule',
      reason: 'Consistent monitoring helps maintain risk awareness'
    })
  }
  
  return recommendations
}

function generateBenchmarkRecommendations(comparison: any) {
  const recommendations = []
  
  if (comparison.overall.riskScore.performance === 'worse') {
    recommendations.push({
      priority: 'high',
      action: 'Improve risk identification and assessment processes',
      reason: `Risk scores are ${Math.abs(comparison.overall.riskScore.gap).toFixed(1)} points above industry average`
    })
  }
  
  if (comparison.overall.mitigation.performance === 'worse') {
    recommendations.push({
      priority: 'high',
      action: 'Enhance risk treatment effectiveness',
      reason: `Mitigation rate is ${Math.abs(comparison.overall.mitigation.gap * 100).toFixed(1)}% below industry standard`
    })
  }
  
  return recommendations
}