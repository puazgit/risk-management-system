import nodemailer from 'nodemailer'
import { prisma } from '@/lib/prisma'

export interface EmailOptions {
  to: string[]
  subject: string
  html?: string
  text?: string
  attachments?: {
    filename: string
    content: Buffer
    contentType: string
  }[]
}

export interface ReportEmailData {
  reportName: string
  period: string
  generatedAt: Date
  recipientName?: string
  reportUrl?: string
}

export class EmailService {
  private transporter: nodemailer.Transporter

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    })
  }

  async sendReportEmail(
    reportBuffer: Buffer,
    filename: string,
    recipients: string[],
    reportData: ReportEmailData
  ): Promise<boolean> {
    try {
      // Get default email template or create one
      const template = await this.getEmailTemplate('report_notification')
      
      const emailHtml = this.generateReportEmailHTML(reportData, template)
      const emailText = this.generateReportEmailText(reportData)

      const emailOptions: EmailOptions = {
        to: recipients,
        subject: `${reportData.reportName} - ${reportData.period}`,
        html: emailHtml,
        text: emailText,
        attachments: [
          {
            filename,
            content: reportBuffer,
            contentType: 'application/pdf'
          }
        ]
      }

      await this.sendEmail(emailOptions)
      return true
    } catch (error) {
      console.error('Error sending report email:', error)
      throw error
    }
  }

  async sendEmail(options: EmailOptions): Promise<void> {
    try {
      const mailOptions = {
        from: `"Risk Management System" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
        to: options.to.join(', '),
        subject: options.subject,
        html: options.html,
        text: options.text,
        attachments: options.attachments
      }

      const result = await this.transporter.sendMail(mailOptions)
      console.log('Email sent successfully:', result.messageId)
    } catch (error) {
      console.error('Error sending email:', error)
      throw error
    }
  }

  async sendScheduledReportNotification(
    scheduledReportId: number,
    reportBuffer: Buffer,
    filename: string
  ): Promise<boolean> {
    try {
      // Get scheduled report details
      const scheduledReport = await prisma.scheduledReport.findUnique({
        where: { id: scheduledReportId },
        include: {
          template: true
        }
      })

      if (!scheduledReport) {
        throw new Error(`Scheduled report with ID ${scheduledReportId} not found`)
      }

      const recipients = JSON.parse(scheduledReport.recipientEmails)
      
      const reportData: ReportEmailData = {
        reportName: scheduledReport.name,
        period: this.formatPeriod(new Date()),
        generatedAt: new Date()
      }

      return await this.sendReportEmail(reportBuffer, filename, recipients, reportData)
    } catch (error) {
      console.error('Error sending scheduled report notification:', error)
      throw error
    }
  }

  private async getEmailTemplate(templateType: string): Promise<any> {
    try {
      const template = await prisma.emailTemplate.findFirst({
        where: { 
          name: templateType,
          isDefault: true 
        }
      })

      if (template) {
        return template
      }

      // Return default template if none found
      return this.getDefaultReportTemplate()
    } catch (error) {
      console.error('Error getting email template:', error)
      return this.getDefaultReportTemplate()
    }
  }

  private getDefaultReportTemplate() {
    return {
      subject: 'Risk Management Report - {{reportName}}',
      htmlBody: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Risk Management Report</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .header { background-color: #3498db; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; }
            .footer { background-color: #f8f9fa; padding: 15px; text-align: center; font-size: 12px; color: #666; }
            .button { background-color: #3498db; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Risk Management System</h1>
            <p>Automated Report Notification</p>
          </div>
          <div class="content">
            <h2>{{reportName}}</h2>
            <p>Your scheduled risk report has been generated and is attached to this email.</p>
            
            <p><strong>Report Details:</strong></p>
            <ul>
              <li>Report Name: {{reportName}}</li>
              <li>Period: {{period}}</li>
              <li>Generated: {{generatedAt}}</li>
            </ul>
            
            <p>Please find the PDF report attached to this email.</p>
            
            {{#if reportUrl}}
            <p>You can also access the report online:</p>
            <a href="{{reportUrl}}" class="button">View Report Online</a>
            {{/if}}
            
            <p>If you have any questions about this report, please contact the risk management team.</p>
          </div>
          <div class="footer">
            <p>This is an automated email from the Risk Management System.</p>
            <p>Please do not reply to this email.</p>
          </div>
        </body>
        </html>
      `,
      textBody: `
Risk Management System - Automated Report

{{reportName}}

Your scheduled risk report has been generated and is attached to this email.

Report Details:
- Report Name: {{reportName}}
- Period: {{period}}
- Generated: {{generatedAt}}

Please find the PDF report attached to this email.

{{#if reportUrl}}
You can also access the report online: {{reportUrl}}
{{/if}}

If you have any questions about this report, please contact the risk management team.

This is an automated email from the Risk Management System.
Please do not reply to this email.
      `
    }
  }

  private generateReportEmailHTML(reportData: ReportEmailData, template: any): string {
    let html = template.htmlBody || this.getDefaultReportTemplate().htmlBody
    
    // Simple template replacement
    html = html.replace(/\{\{reportName\}\}/g, reportData.reportName)
    html = html.replace(/\{\{period\}\}/g, reportData.period)
    html = html.replace(/\{\{generatedAt\}\}/g, reportData.generatedAt.toLocaleString('id-ID'))
    
    if (reportData.recipientName) {
      html = html.replace(/\{\{recipientName\}\}/g, reportData.recipientName)
    }
    
    if (reportData.reportUrl) {
      const reportUrlPattern = /\{\{#if reportUrl\}\}[\s\S]*?\{\{\/if\}\}/
      const reportUrlSection = html.match(reportUrlPattern)
      if (reportUrlSection) {
        html = html.replace(reportUrlPattern, 
          `<p>You can also access the report online:</p>
           <a href="${reportData.reportUrl}" class="button">View Report Online</a>`)
      }
    } else {
      html = html.replace(/\{\{#if reportUrl\}\}[\s\S]*?\{\{\/if\}\}/, '')
    }

    return html
  }

  private generateReportEmailText(reportData: ReportEmailData): string {
    return `
Risk Management System - Automated Report

${reportData.reportName}

Your scheduled risk report has been generated and is attached to this email.

Report Details:
- Report Name: ${reportData.reportName}
- Period: ${reportData.period}
- Generated: ${reportData.generatedAt.toLocaleString('id-ID')}

Please find the PDF report attached to this email.

${reportData.reportUrl ? `You can also access the report online: ${reportData.reportUrl}` : ''}

If you have any questions about this report, please contact the risk management team.

This is an automated email from the Risk Management System.
Please do not reply to this email.
    `.trim()
  }

  private formatPeriod(date: Date): string {
    return date.toLocaleDateString('id-ID', { 
      year: 'numeric', 
      month: 'long' 
    })
  }

  async testConnection(): Promise<boolean> {
    try {
      await this.transporter.verify()
      console.log('SMTP connection verified successfully')
      return true
    } catch (error) {
      console.error('SMTP connection failed:', error)
      return false
    }
  }
}

export const emailService = new EmailService()