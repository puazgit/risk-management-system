import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { reportScheduler } from '@/lib/services/report-scheduler'
import { z } from 'zod'
import * as cron from 'node-cron'

// Request validation schemas
const createScheduledReportSchema = z.object({
  templateId: z.number(),
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  cronExpression: z.string(),
  recipientEmails: z.array(z.string().email())
})

const updateScheduledReportSchema = createScheduledReportSchema.partial()

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
    const isActive = searchParams.get('isActive')

    const where: any = {}
    if (isActive !== null) where.isActive = isActive === 'true'

    const scheduledReports = await prisma.scheduledReport.findMany({
      where,
      include: {
        template: true,
        executions: {
          orderBy: { startedAt: 'desc' },
          take: 5
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({ scheduledReports })

  } catch (error) {
    console.error('Error fetching scheduled reports:', error)
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
    const { templateId, name, description, cronExpression, recipientEmails } = createScheduledReportSchema.parse(body)

    // Validate cron expression
    if (!cron.validate(cronExpression)) {
      return NextResponse.json(
        { error: 'Invalid cron expression' },
        { status: 400 }
      )
    }

    // Check if template exists
    const template = await prisma.reportTemplate.findUnique({
      where: { id: templateId }
    })

    if (!template) {
      return NextResponse.json(
        { error: 'Template not found' },
        { status: 404 }
      )
    }

    // Create scheduled report
    const scheduledReport = await prisma.scheduledReport.create({
      data: {
        templateId,
        name,
        description,
        cronExpression,
        recipientEmails: JSON.stringify(recipientEmails),
        createdBy: session.user?.id || 'unknown'
      },
      include: {
        template: true
      }
    })

    // Schedule the report
    try {
      await reportScheduler.scheduleReport(scheduledReport)
    } catch (schedulingError) {
      console.error('Error scheduling report:', schedulingError)
      // Don't fail the creation, just log the error
    }

    return NextResponse.json(
      { scheduledReport },
      { status: 201 }
    )

  } catch (error) {
    console.error('Error creating scheduled report:', error)
    
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