import { prisma } from '@/lib/prisma'

const defaultTemplates = [
  {
    name: 'Monthly Risk Summary',
    description: 'Comprehensive monthly risk assessment report',
    reportType: 'MONTHLY',
    template: JSON.stringify({
      layout: 'standard',
      sections: [
        {
          type: 'summary',
          title: 'Executive Summary',
          includeStats: true
        },
        {
          type: 'risk-table',
          title: 'High Priority Risks',
          filter: { riskLevel: 'HIGH' },
          limit: 10
        },
        {
          type: 'risk-matrix',
          title: 'Risk Matrix'
        },
        {
          type: 'trends',
          title: 'Risk Trends',
          period: 'monthly'
        }
      ],
      footer: {
        includeTimestamp: true,
        includePageNumbers: true
      }
    })
  },
  {
    name: 'Quarterly Analytics Report',
    description: 'Detailed quarterly analytics and KRI performance',
    reportType: 'QUARTERLY',
    template: JSON.stringify({
      layout: 'detailed',
      sections: [
        {
          type: 'summary',
          title: 'Quarterly Overview'
        },
        {
          type: 'analytics',
          title: 'Risk Analytics',
          includeCharts: true
        },
        {
          type: 'kri-performance',
          title: 'KRI Performance'
        },
        {
          type: 'recommendations',
          title: 'Recommendations'
        }
      ]
    })
  },
  {
    name: 'Risk Matrix Report',
    description: 'Current risk positioning and matrix visualization',
    reportType: 'CUSTOM',
    template: JSON.stringify({
      layout: 'compact',
      sections: [
        {
          type: 'risk-matrix',
          title: 'Current Risk Matrix',
          includeDetails: true
        },
        {
          type: 'risk-table',
          title: 'All Risks by Category',
          groupBy: 'category'
        }
      ]
    })
  },
  {
    name: 'Executive Dashboard',
    description: 'High-level executive summary for leadership',
    reportType: 'MONTHLY',
    template: JSON.stringify({
      layout: 'executive',
      sections: [
        {
          type: 'key-metrics',
          title: 'Key Risk Metrics'
        },
        {
          type: 'top-risks',
          title: 'Top 5 Risks',
          limit: 5
        },
        {
          type: 'trends',
          title: 'Trend Analysis'
        }
      ]
    })
  }
]

const defaultEmailTemplates = [
  {
    name: 'report_notification',
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

This is an automated email from the Risk Management System.
Please do not reply to this email.
    `,
    isDefault: true
  }
]

async function seedReportTemplates() {
  console.log('Seeding report templates...')
  
  try {
    // Create report templates
    for (const template of defaultTemplates) {
      const existing = await prisma.reportTemplate.findFirst({
        where: { name: template.name }
      })
      
      if (!existing) {
        await prisma.reportTemplate.create({
          data: {
            ...template,
            createdBy: 'system'
          }
        })
        console.log(`Created template: ${template.name}`)
      } else {
        console.log(`Template already exists: ${template.name}`)
      }
    }
    
    // Create email templates
    for (const emailTemplate of defaultEmailTemplates) {
      const existing = await prisma.emailTemplate.findFirst({
        where: { name: emailTemplate.name }
      })
      
      if (!existing) {
        await prisma.emailTemplate.create({
          data: emailTemplate
        })
        console.log(`Created email template: ${emailTemplate.name}`)
      } else {
        console.log(`Email template already exists: ${emailTemplate.name}`)
      }
    }
    
    console.log('Report templates seeding completed!')
    
  } catch (error) {
    console.error('Error seeding report templates:', error)
    throw error
  }
}

export { seedReportTemplates }

// Run seeder if called directly
if (require.main === module) {
  seedReportTemplates()
    .then(() => {
      console.log('Seeding completed successfully')
      process.exit(0)
    })
    .catch((error) => {
      console.error('Seeding failed:', error)
      process.exit(1)
    })
}