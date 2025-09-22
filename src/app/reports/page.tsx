'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table'
import { 
  Download,
  FileText,
  Calendar,
  Clock,
  Mail,
  Settings,
  Play,
  Pause,
  Plus
} from 'lucide-react'
import { format } from 'date-fns'
import { id } from 'date-fns/locale'

interface ReportTemplate {
  id: number
  name: string
  description?: string
  reportType: string
  isActive: boolean
  createdAt: string
  createdBy?: string
}

interface ScheduledReport {
  id: number
  name: string
  description?: string
  cronExpression: string
  recipientEmails: string
  isActive: boolean
  lastRun?: string
  nextRun?: string
  template: ReportTemplate
  executions: ReportExecution[]
}

interface ReportExecution {
  id: number
  status: string
  startedAt: string
  completedAt?: string
  filePath?: string
  emailSent: boolean
  errorMessage?: string
  executionTime?: number
}

interface ReportHistory {
  id: number
  reportType: string
  status: string
  createdAt: string
  completedAt?: string
  template?: ReportTemplate
}

export default function ReportsPage() {
  const [templates, setTemplates] = useState<ReportTemplate[]>([])
  const [scheduledReports, setScheduledReports] = useState<ScheduledReport[]>([])
  const [reportHistory, setReportHistory] = useState<ReportHistory[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [templatesRes, scheduledRes, historyRes] = await Promise.all([
        fetch('/api/reports/templates'),
        fetch('/api/reports/scheduled'),
        fetch('/api/reports/generate')
      ])

      const [templatesData, scheduledData, historyData] = await Promise.all([
        templatesRes.json(),
        scheduledRes.json(),
        historyRes.json()
      ])

      setTemplates(templatesData.templates || [])
      setScheduledReports(scheduledData.scheduledReports || [])
      setReportHistory(historyData.reports || [])
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  const generateReport = async (templateId: number) => {
    try {
      console.log('Generating report for template:', templateId)
      
      const response = await fetch('/api/reports/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          templateId,
          parameters: {
            period: 'current'
          }
        })
      })

      console.log('Response status:', response.status)
      console.log('Response headers:', response.headers)

      if (response.ok) {
        const blob = await response.blob()
        console.log('Blob size:', blob.size)
        
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.style.display = 'none'
        a.href = url
        a.download = `report_${templateId}_${new Date().toISOString().slice(0, 10)}.pdf`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        window.URL.revokeObjectURL(url)
        
        console.log('Report downloaded successfully')
        
        // Reload history
        loadData()
      } else {
        const errorText = await response.text()
        console.error('Error generating report. Status:', response.status)
        console.error('Error response:', errorText)
        
        try {
          const errorJson = JSON.parse(errorText)
          alert(`Error generating report: ${errorJson.error || 'Unknown error'}`)
        } catch {
          alert(`Error generating report: ${response.status} ${response.statusText}`)
        }
      }
    } catch (error) {
      console.error('Error generating report:', error)
      alert(`Error generating report: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      'COMPLETED': 'default',
      'GENERATING': 'secondary',
      'FAILED': 'destructive',
      'PENDING': 'outline',
      'RUNNING': 'secondary'
    }
    
    return (
      <Badge variant={variants[status] || 'outline'}>
        {status}
      </Badge>
    )
  }

  const formatCronExpression = (cron: string) => {
    // Simple cron expression formatter
    const parts = cron.split(' ')
    if (parts.length >= 5) {
      const [minute, hour, day, month, dayOfWeek] = parts
      
      if (minute === '0' && hour !== '*') {
        return `Daily at ${hour}:00`
      }
      if (dayOfWeek !== '*') {
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
        return `Weekly on ${days[parseInt(dayOfWeek)]}`
      }
      if (day === '1') {
        return 'Monthly on 1st'
      }
    }
    return cron
  }

  if (loading) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Report Management</h1>
          <p className="text-muted-foreground">
            Manage automated report generation, templates, and schedules
          </p>
        </div>
        <div className="flex space-x-2">
          <Button onClick={() => window.location.href = '/reports/builder'}>
            <Plus className="mr-2 h-4 w-4" />
            Custom Report Builder
          </Button>
          <Button variant="outline">
            <Plus className="mr-2 h-4 w-4" />
            New Template
          </Button>
          <Button variant="outline">
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </Button>
        </div>
      </div>

      <Tabs defaultValue="templates" className="space-y-4">
        <TabsList>
          <TabsTrigger value="templates">Report Templates</TabsTrigger>
          <TabsTrigger value="scheduled">Scheduled Reports</TabsTrigger>
          <TabsTrigger value="history">Report History</TabsTrigger>
        </TabsList>

        <TabsContent value="templates" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {templates.map((template) => (
              <Card key={template.id}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>{template.name}</span>
                    <Badge>{template.reportType}</Badge>
                  </CardTitle>
                  {template.description && (
                    <CardDescription>{template.description}</CardDescription>
                  )}
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center">
                    <div className="text-sm text-muted-foreground">
                      Created {format(new Date(template.createdAt), 'MMM d, yyyy', { locale: id })}
                    </div>
                    <Button 
                      size="sm" 
                      onClick={() => generateReport(template.id)}
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Generate
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="scheduled" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Scheduled Reports</CardTitle>
              <CardDescription>
                Automated reports that run on schedule
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Template</TableHead>
                    <TableHead>Schedule</TableHead>
                    <TableHead>Recipients</TableHead>
                    <TableHead>Last Run</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {scheduledReports.map((report) => (
                    <TableRow key={report.id}>
                      <TableCell className="font-medium">{report.name}</TableCell>
                      <TableCell>{report.template.name}</TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <Calendar className="mr-2 h-4 w-4" />
                          {formatCronExpression(report.cronExpression)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <Mail className="mr-2 h-4 w-4" />
                          {JSON.parse(report.recipientEmails).length} recipients
                        </div>
                      </TableCell>
                      <TableCell>
                        {report.lastRun ? (
                          <div className="flex items-center">
                            <Clock className="mr-2 h-4 w-4" />
                            {format(new Date(report.lastRun), 'MMM d, HH:mm', { locale: id })}
                          </div>
                        ) : (
                          'Never'
                        )}
                      </TableCell>
                      <TableCell>
                        {report.executions.length > 0 ? (
                          getStatusBadge(report.executions[0].status)
                        ) : (
                          <Badge variant="outline">No runs</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button size="sm" variant="outline">
                            {report.isActive ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                          </Button>
                          <Button size="sm" variant="outline">
                            <Settings className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Report Generation History</CardTitle>
              <CardDescription>
                History of all generated reports
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Report Type</TableHead>
                    <TableHead>Template</TableHead>
                    <TableHead>Generated</TableHead>
                    <TableHead>Completed</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reportHistory.map((report) => (
                    <TableRow key={report.id}>
                      <TableCell>
                        <div className="flex items-center">
                          <FileText className="mr-2 h-4 w-4" />
                          {report.reportType}
                        </div>
                      </TableCell>
                      <TableCell>{report.template?.name || 'Unknown'}</TableCell>
                      <TableCell>
                        {format(new Date(report.createdAt), 'MMM d, HH:mm', { locale: id })}
                      </TableCell>
                      <TableCell>
                        {report.completedAt 
                          ? format(new Date(report.completedAt), 'MMM d, HH:mm', { locale: id })
                          : '-'
                        }
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(report.status)}
                      </TableCell>
                      <TableCell>
                        {report.status === 'COMPLETED' && (
                          <Button size="sm" variant="outline">
                            <Download className="mr-2 h-4 w-4" />
                            Download
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}