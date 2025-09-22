import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { pdfGenerator } from '@/lib/services/pdf-generator'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

// Request validation schema
const generateReportSchema = z.object({
  templateId: z.number(),
  parameters: z.object({
    period: z.string().optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    filters: z.any().optional()
  }).optional()
})

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
    const { templateId, parameters = {} } = generateReportSchema.parse(body)

    // Check if template exists
    const template = await prisma.reportTemplate.findUnique({
      where: { id: templateId }
    })

    if (!template) {
      return NextResponse.json(
        { error: 'Report template not found' },
        { status: 404 }
      )
    }

    // Create report history record
    const reportHistory = await prisma.reportHistory.create({
      data: {
        templateId,
        generatedBy: session.user?.id || 'unknown',
        reportType: template.reportType,
        parameters: JSON.stringify(parameters),
        status: 'GENERATING'
      }
    })

    try {
      // Generate PDF report
      const reportBuffer = await pdfGenerator.generateReport(templateId, parameters)
      
      // Update report history with completion
      await prisma.reportHistory.update({
        where: { id: reportHistory.id },
        data: {
          status: 'COMPLETED',
          completedAt: new Date()
        }
      })

      // Return PDF as response
      const response = new Response(new Uint8Array(reportBuffer), {
        status: 200,
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="report_${template.name}_${new Date().toISOString().slice(0, 10)}.pdf"`
        }
      })
      
      return response

    } catch (error) {
      // Update report history with failure
      await prisma.reportHistory.update({
        where: { id: reportHistory.id },
        data: {
          status: 'FAILED',
          completedAt: new Date()
        }
      })
      throw error
    }

  } catch (error) {
    console.error('Error generating report:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.issues },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

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
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const status = searchParams.get('status')

    const skip = (page - 1) * limit
    const where = status ? { status } : {}

    // Get report history
    const [reports, total] = await Promise.all([
      prisma.reportHistory.findMany({
        where,
        include: {
          template: true
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.reportHistory.count({ where })
    ])

    return NextResponse.json({
      reports,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    })

  } catch (error) {
    console.error('Error fetching report history:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}