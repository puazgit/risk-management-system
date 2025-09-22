import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

// Request validation schemas
const createTemplateSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  reportType: z.enum(['MONTHLY', 'QUARTERLY', 'ANNUAL', 'CUSTOM']),
  template: z.string() // JSON template configuration
})

const updateTemplateSchema = createTemplateSchema.partial()

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
    const reportType = searchParams.get('reportType')
    const isActive = searchParams.get('isActive')

    const where: any = {}
    if (reportType) where.reportType = reportType
    if (isActive !== null) where.isActive = isActive === 'true'

    const templates = await prisma.reportTemplate.findMany({
      where,
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({ templates })

  } catch (error) {
    console.error('Error fetching templates:', error)
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
    const { name, description, reportType, template } = createTemplateSchema.parse(body)

    // Validate template JSON
    try {
      JSON.parse(template)
    } catch {
      return NextResponse.json(
        { error: 'Invalid template JSON' },
        { status: 400 }
      )
    }

    const newTemplate = await prisma.reportTemplate.create({
      data: {
        name,
        description,
        reportType,
        template,
        createdBy: session.user?.id || 'unknown'
      }
    })

    return NextResponse.json(
      { template: newTemplate },
      { status: 201 }
    )

  } catch (error) {
    console.error('Error creating template:', error)
    
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