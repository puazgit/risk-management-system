import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

// Schema for custom report configuration
const customReportSchema = z.object({
  name: z.string().min(1, 'Report name is required'),
  description: z.string().optional(),
  filters: z.object({
    unitKerjaIds: z.array(z.number()).optional(),
    kategoriIds: z.array(z.number()).optional(),
    riskLevels: z.array(z.enum(['HIGH', 'MEDIUM', 'LOW'])).optional(),
    dateRange: z.object({
      start: z.string(),
      end: z.string()
    }).optional(),
    treatmentStatus: z.array(z.string()).optional()
  }),
  columns: z.array(z.object({
    field: z.string(),
    label: z.string(),
    type: z.enum(['text', 'number', 'date', 'status', 'currency']),
    visible: z.boolean().default(true),
    sortable: z.boolean().default(true)
  })),
  groupBy: z.array(z.string()).optional(),
  sortBy: z.object({
    field: z.string(),
    direction: z.enum(['asc', 'desc'])
  }).optional(),
  includeCharts: z.boolean().default(false),
  chartTypes: z.array(z.enum(['pie', 'bar', 'line', 'heatmap'])).optional()
})

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(req.url)
    const action = searchParams.get('action')

    switch (action) {
      case 'schema':
        return getReportSchema()
      case 'preview':
        const previewConfig = searchParams.get('config')
        return previewReport(previewConfig ? JSON.parse(previewConfig) : {})
      default:
        return getSavedReports()
    }

  } catch (error) {
    console.error('Error in custom reports API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await req.json()
    const validatedData = customReportSchema.parse(body)

    // Generate the custom report
    const reportData = await generateCustomReport(validatedData)
    
    return NextResponse.json({
      success: true,
      data: reportData,
      metadata: {
        totalRecords: reportData.length,
        generatedAt: new Date().toISOString(),
        filters: validatedData.filters,
        columns: validatedData.columns
      }
    })

  } catch (error) {
    console.error('Error generating custom report:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to generate report' },
      { status: 500 }
    )
  }
}

async function getReportSchema() {
  const [unitKerja, kategori] = await Promise.all([
    prisma.unitKerja.findMany({
      select: { id: true, name: true }
    }),
    prisma.taksonomiRisiko.findMany({
      select: { id: true, categoryBUMN: true }
    })
  ])

  const schema = {
    availableFilters: {
      unitKerja: unitKerja.map(u => ({ id: u.id, nama: u.name })),
      kategori: kategori.map(k => ({ id: k.id, nama: k.categoryBUMN })),
      riskLevels: [
        { value: 'HIGH', label: 'High Risk' },
        { value: 'MEDIUM', label: 'Medium Risk' },
        { value: 'LOW', label: 'Low Risk' }
      ],
      treatmentStatus: [
        { value: 'PLANNING', label: 'Planning' },
        { value: 'IN_PROGRESS', label: 'In Progress' },
        { value: 'COMPLETED', label: 'Completed' },
        { value: 'DELAYED', label: 'Delayed' }
      ]
    },
    availableColumns: [
      { field: 'namaRisiko', label: 'Nama Risiko', type: 'text' },
      { field: 'unitKerja', label: 'Unit Kerja', type: 'text' },
      { field: 'kategori', label: 'Kategori', type: 'text' },
      { field: 'riskLevel', label: 'Risk Level', type: 'status' },
      { field: 'dampakInheren', label: 'Dampak Inheren', type: 'number' },
      { field: 'kemungkinanInheren', label: 'Kemungkinan Inheren', type: 'number' },
      { field: 'riskScoreInheren', label: 'Risk Score Inheren', type: 'number' },
      { field: 'dampakResidual', label: 'Dampak Residual', type: 'number' },
      { field: 'kemungkinanResidual', label: 'Kemungkinan Residual', type: 'number' },
      { field: 'riskScoreResidual', label: 'Risk Score Residual', type: 'number' },
      { field: 'treatmentPlan', label: 'Treatment Plan', type: 'text' },
      { field: 'treatmentCost', label: 'Treatment Cost', type: 'currency' },
      { field: 'treatmentProgress', label: 'Treatment Progress', type: 'number' },
      { field: 'createdAt', label: 'Created Date', type: 'date' },
      { field: 'updatedAt', label: 'Updated Date', type: 'date' }
    ],
    chartTypes: [
      { value: 'pie', label: 'Pie Chart' },
      { value: 'bar', label: 'Bar Chart' },
      { value: 'line', label: 'Line Chart' },
      { value: 'heatmap', label: 'Heat Map' }
    ]
  }

  return NextResponse.json(schema)
}

async function generateCustomReport(config: any) {
  const { filters, columns } = config

  // Build the query based on filters
  const whereClause: any = {}

  if (filters.unitKerjaIds?.length > 0) {
    whereClause.ownerUnitId = {
      in: filters.unitKerjaIds
    }
  }

  if (filters.kategoriIds?.length > 0) {
    whereClause.kategoriId = {
      in: filters.kategoriIds
    }
  }

  if (filters.dateRange) {
    whereClause.createdAt = {
      gte: new Date(filters.dateRange.start),
      lte: new Date(filters.dateRange.end)
    }
  }

  // Fetch the data with relations
  const risks = await prisma.risiko.findMany({
    where: whereClause,
    include: {
      ownerUnit: true,
      kategori: true,
      risikoInheren: true,
      risikoResidual: true,
      perlakuanRisiko: {
        include: {
          realisasi: {
            orderBy: { periode: 'desc' },
            take: 1
          }
        }
      }
    },
    orderBy: { id: 'asc' }
  })

  // Transform the data based on selected columns
  const reportData = risks.map(risk => {
    const inheren = risk.risikoInheren
    const residual = risk.risikoResidual
    const treatment = risk.perlakuanRisiko[0]
    const realisasi = treatment?.realisasi[0]

    const row: any = {}

    columns.forEach((col: any) => {
      if (!col.visible) return

      switch (col.field) {
        case 'namaRisiko':
          row[col.field] = risk.namaRisiko
          break
        case 'unitKerja':
          row[col.field] = risk.ownerUnit?.name || 'N/A'
          break
        case 'kategori':
          row[col.field] = risk.kategori?.categoryBUMN || 'N/A'
          break
        case 'riskLevel':
          const riskScore = residual?.residualDampakValue && residual?.residualProbValue 
            ? residual.residualDampakValue * residual.residualProbValue 
            : inheren?.inherenDampakValue && inheren?.inherenProbValue
            ? inheren.inherenDampakValue * inheren.inherenProbValue 
            : 0
          row[col.field] = riskScore >= 15 ? 'HIGH' : riskScore >= 8 ? 'MEDIUM' : 'LOW'
          break
        case 'dampakInheren':
          row[col.field] = inheren?.inherenDampakValue || 0
          break
        case 'kemungkinanInheren':
          row[col.field] = inheren?.inherenProbValue || 0
          break
        case 'riskScoreInheren':
          row[col.field] = inheren?.inherenDampakValue && inheren?.inherenProbValue 
            ? inheren.inherenDampakValue * inheren.inherenProbValue : 0
          break
        case 'dampakResidual':
          row[col.field] = residual?.residualDampakValue || 0
          break
        case 'kemungkinanResidual':
          row[col.field] = residual?.residualProbValue || 0
          break
        case 'riskScoreResidual':
          row[col.field] = residual?.residualDampakValue && residual?.residualProbValue 
            ? residual.residualDampakValue * residual.residualProbValue : 0
          break
        case 'treatmentPlan':
          row[col.field] = treatment?.treatmentPlan || 'No treatment plan'
          break
        case 'treatmentCost':
          row[col.field] = treatment?.costRupiah || 0
          break
        case 'treatmentProgress':
          row[col.field] = realisasi?.persentaseSerapan || 0
          break
        case 'createdAt':
          row[col.field] = risk.createdAt
          break
        case 'updatedAt':
          row[col.field] = risk.updatedAt
          break
        default:
          row[col.field] = null
      }
    })

    return row
  })

  // Apply additional filters
  let filteredData = reportData

  if (filters.riskLevels?.length > 0) {
    filteredData = filteredData.filter(row => 
      filters.riskLevels.includes(row.riskLevel)
    )
  }

  if (filters.treatmentStatus?.length > 0) {
    // This would need additional logic based on treatment status
    // For now, we'll keep all data
  }

  return filteredData
}

async function getSavedReports() {
  // For now, return empty array
  // In the future, we could store custom report configurations
  return NextResponse.json({
    savedReports: []
  })
}

async function previewReport(config: any) {
  try {
    const limitedConfig = {
      ...config,
      // Limit preview to 10 records
      limit: 10
    }
    
    const data = await generateCustomReport(limitedConfig)
    const preview = data.slice(0, 10)
    
    return NextResponse.json({
      success: true,
      preview,
      totalRecords: data.length,
      previewRecords: preview.length
    })
  } catch (error) {
    return NextResponse.json({
      error: 'Failed to generate preview'
    }, { status: 500 })
  }
}