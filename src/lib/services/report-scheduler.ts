import * as cron from 'node-cron'
import { prisma } from '@/lib/prisma'
import { pdfGenerator } from './pdf-generator'
import { emailService } from './email-service'
import fs from 'fs/promises'
import path from 'path'

export interface ScheduledReportJob {
  id: number
  name: string
  cronExpression: string
  task: any // Use any for now since node-cron types are complex
}

export class ReportSchedulerService {
  private scheduledJobs: Map<number, ScheduledReportJob> = new Map()
  private reportsDir: string

  constructor() {
    this.reportsDir = path.join(process.cwd(), 'generated-reports')
    this.ensureReportsDirectory()
  }

  async initialize(): Promise<void> {
    try {
      console.log('Initializing Report Scheduler Service...')
      
      // Load all active scheduled reports
      const scheduledReports = await prisma.scheduledReport.findMany({
        where: { isActive: true },
        include: { template: true }
      })

      console.log(`Found ${scheduledReports.length} active scheduled reports`)

      // Schedule each report
      for (const report of scheduledReports) {
        await this.scheduleReport(report)
      }

      console.log('Report Scheduler Service initialized successfully')
    } catch (error) {
      console.error('Error initializing Report Scheduler Service:', error)
      throw error
    }
  }

  async scheduleReport(scheduledReport: any): Promise<void> {
    try {
      const { id, name, cronExpression } = scheduledReport

      // Validate cron expression
      if (!cron.validate(cronExpression)) {
        throw new Error(`Invalid cron expression: ${cronExpression}`)
      }

      // Create scheduled task
      const task = cron.schedule(cronExpression, async () => {
        await this.executeScheduledReport(id)
      }, {
        timezone: 'Asia/Jakarta'
      })

      // Store the job
      const job: ScheduledReportJob = {
        id,
        name,
        cronExpression,
        task
      }

      this.scheduledJobs.set(id, job)

      // Update next run time
      await this.updateNextRunTime(id, cronExpression)

      console.log(`Scheduled report "${name}" (ID: ${id}) with cron: ${cronExpression}`)
    } catch (error) {
      console.error(`Error scheduling report ${scheduledReport.id}:`, error)
      throw error
    }
  }

  async executeScheduledReport(scheduledReportId: number): Promise<void> {
    let execution: any = null

    try {
      console.log(`Executing scheduled report ID: ${scheduledReportId}`)

      // Get scheduled report details
      const scheduledReport = await prisma.scheduledReport.findUnique({
        where: { id: scheduledReportId },
        include: { template: true }
      })

      if (!scheduledReport) {
        throw new Error(`Scheduled report with ID ${scheduledReportId} not found`)
      }

      // Create execution record
      execution = await prisma.reportExecution.create({
        data: {
          scheduledReportId,
          status: 'RUNNING',
          startedAt: new Date()
        }
      })

      const startTime = Date.now()

      // Generate report parameters based on current date
      const reportParameters = this.generateReportParameters(scheduledReport.template.reportType)

      // Generate PDF report
      console.log(`Generating PDF report for template: ${scheduledReport.template.name}`)
      const reportBuffer = await pdfGenerator.generateReport(
        scheduledReport.templateId,
        reportParameters
      )

      // Save report to file
      const filename = this.generateFilename(scheduledReport.name, scheduledReport.template.reportType)
      const filePath = path.join(this.reportsDir, filename)
      await fs.writeFile(filePath, reportBuffer)

      // Send email notification
      console.log(`Sending email notification for report: ${scheduledReport.name}`)
      const emailSent = await emailService.sendScheduledReportNotification(
        scheduledReportId,
        reportBuffer,
        filename
      )

      const executionTime = Date.now() - startTime

      // Update execution record as completed
      await prisma.reportExecution.update({
        where: { id: execution.id },
        data: {
          status: 'COMPLETED',
          completedAt: new Date(),
          filePath,
          emailSent,
          emailSentAt: emailSent ? new Date() : null,
          executionTime
        }
      })

      // Update scheduled report last run time
      await prisma.scheduledReport.update({
        where: { id: scheduledReportId },
        data: { lastRun: new Date() }
      })

      // Update next run time
      await this.updateNextRunTime(scheduledReportId, scheduledReport.cronExpression)

      console.log(`Successfully executed scheduled report "${scheduledReport.name}" in ${executionTime}ms`)

    } catch (error) {
      console.error(`Error executing scheduled report ${scheduledReportId}:`, error)

      // Update execution record as failed
      if (execution) {
        await prisma.reportExecution.update({
          where: { id: execution.id },
          data: {
            status: 'FAILED',
            completedAt: new Date(),
            errorMessage: error instanceof Error ? error.message : 'Unknown error',
            executionTime: Date.now() - new Date(execution.startedAt).getTime()
          }
        })
      }

      throw error
    }
  }

  async unscheduleReport(scheduledReportId: number): Promise<void> {
    const job = this.scheduledJobs.get(scheduledReportId)
    
    if (job) {
      job.task.stop()
      job.task.destroy()
      this.scheduledJobs.delete(scheduledReportId)
      console.log(`Unscheduled report "${job.name}" (ID: ${scheduledReportId})`)
    }
  }

  async rescheduleReport(scheduledReportId: number): Promise<void> {
    // First unschedule the existing job
    await this.unscheduleReport(scheduledReportId)

    // Get updated scheduled report
    const scheduledReport = await prisma.scheduledReport.findUnique({
      where: { id: scheduledReportId },
      include: { template: true }
    })

    if (scheduledReport && scheduledReport.isActive) {
      await this.scheduleReport(scheduledReport)
    }
  }

  private generateReportParameters(reportType: string): any {
    const now = new Date()
    const period = this.getCurrentPeriod(now)

    switch (reportType) {
      case 'MONTHLY':
        return {
          period: 'monthly',
          startDate: new Date(now.getFullYear(), now.getMonth(), 1),
          endDate: new Date(now.getFullYear(), now.getMonth() + 1, 0),
          periodLabel: period
        }
      case 'QUARTERLY':
        const quarter = Math.floor(now.getMonth() / 3)
        return {
          period: 'quarterly',
          startDate: new Date(now.getFullYear(), quarter * 3, 1),
          endDate: new Date(now.getFullYear(), (quarter + 1) * 3, 0),
          periodLabel: `Q${quarter + 1} ${now.getFullYear()}`
        }
      case 'ANNUAL':
        return {
          period: 'annual',
          startDate: new Date(now.getFullYear(), 0, 1),
          endDate: new Date(now.getFullYear(), 11, 31),
          periodLabel: now.getFullYear().toString()
        }
      default:
        return {
          period: 'current',
          periodLabel: period
        }
    }
  }

  private getCurrentPeriod(date: Date): string {
    return date.toLocaleDateString('id-ID', { 
      year: 'numeric', 
      month: 'long' 
    })
  }

  private generateFilename(reportName: string, reportType: string): string {
    const now = new Date()
    const timestamp = now.toISOString().slice(0, 10) // YYYY-MM-DD
    const safeName = reportName.replace(/[^a-zA-Z0-9]/g, '_')
    return `${safeName}_${reportType}_${timestamp}.pdf`
  }

  private async updateNextRunTime(scheduledReportId: number, cronExpression: string): Promise<void> {
    try {
      // Parse cron expression to calculate next run
      const task = cron.schedule(cronExpression, () => {})
      
      // Get next execution time (this is a simplified approach)
      // In production, you might want to use a more sophisticated cron parser
      const now = new Date()
      const nextRun = new Date(now.getTime() + 24 * 60 * 60 * 1000) // Simple: add 1 day
      
      await prisma.scheduledReport.update({
        where: { id: scheduledReportId },
        data: { nextRun }
      })
      
      task.stop()
    } catch (error) {
      console.error('Error updating next run time:', error)
    }
  }

  private async ensureReportsDirectory(): Promise<void> {
    try {
      await fs.mkdir(this.reportsDir, { recursive: true })
    } catch (error) {
      console.error('Error creating reports directory:', error)
    }
  }

  async getScheduledJobs(): Promise<ScheduledReportJob[]> {
    return Array.from(this.scheduledJobs.values())
  }

  async getExecutionHistory(scheduledReportId?: number): Promise<any[]> {
    const where = scheduledReportId ? { scheduledReportId } : {}
    
    return await prisma.reportExecution.findMany({
      where,
      include: {
        scheduledReport: {
          include: {
            template: true
          }
        }
      },
      orderBy: { startedAt: 'desc' },
      take: 100
    })
  }

  async shutdown(): Promise<void> {
    console.log('Shutting down Report Scheduler Service...')
    
    for (const [id, job] of this.scheduledJobs) {
      job.task.stop()
      job.task.destroy()
      console.log(`Stopped scheduled report: ${job.name} (ID: ${id})`)
    }
    
    this.scheduledJobs.clear()
    console.log('Report Scheduler Service shut down complete')
  }
}

export const reportScheduler = new ReportSchedulerService()