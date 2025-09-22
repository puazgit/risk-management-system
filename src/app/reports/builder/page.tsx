'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Plus, Download, Play, Save, Eye, Settings, Filter, Columns, BarChart3 } from 'lucide-react'
import { toast } from '@/hooks/use-toast'

interface ReportColumn {
  field: string
  label: string
  type: 'text' | 'number' | 'date' | 'status' | 'currency'
  visible: boolean
  sortable: boolean
}

interface ReportFilter {
  unitKerjaIds?: number[]
  kategoriIds?: number[]
  riskLevels?: string[]
  dateRange?: {
    start: string
    end: string
  }
  treatmentStatus?: string[]
}

interface ReportConfig {
  name: string
  description: string
  filters: ReportFilter
  columns: ReportColumn[]
  groupBy?: string[]
  sortBy?: {
    field: string
    direction: 'asc' | 'desc'
  }
  includeCharts: boolean
  chartTypes?: string[]
}

interface ReportSchema {
  availableFilters: {
    unitKerja: { id: number; nama: string }[]
    kategori: { id: number; nama: string }[]
    riskLevels: { value: string; label: string }[]
    treatmentStatus: { value: string; label: string }[]
  }
  availableColumns: ReportColumn[]
  chartTypes: { value: string; label: string }[]
}

export default function CustomReportBuilderPage() {
  const [schema, setSchema] = useState<ReportSchema | null>(null)
  const [config, setConfig] = useState<ReportConfig>({
    name: '',
    description: '',
    filters: {},
    columns: [],
    includeCharts: false
  })
  const [previewData, setPreviewData] = useState<any[]>([])
  const [reportData, setReportData] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [previewLoading, setPreviewLoading] = useState(false)

  useEffect(() => {
    loadSchema()
  }, [])

  const loadSchema = async () => {
    try {
      const response = await fetch('/api/reports/custom?action=schema')
      const data = await response.json()
      setSchema(data)
      
      // Initialize with all columns visible
      setConfig(prev => ({
        ...prev,
        columns: data.availableColumns.map((col: ReportColumn) => ({
          ...col,
          visible: true,
          sortable: true
        }))
      }))
    } catch (error) {
      console.error('Error loading schema:', error)
      toast({
        title: "Error",
        description: "Failed to load report schema",
        variant: "destructive"
      })
    }
  }

  const generatePreview = async () => {
    setPreviewLoading(true)
    try {
      const response = await fetch('/api/reports/custom?action=preview&config=' + 
        encodeURIComponent(JSON.stringify(config)))
      const data = await response.json()
      
      if (data.success) {
        setPreviewData(data.preview)
      } else {
        throw new Error(data.error)
      }
    } catch (error) {
      console.error('Error generating preview:', error)
      toast({
        title: "Error",
        description: "Failed to generate preview",
        variant: "destructive"
      })
    } finally {
      setPreviewLoading(false)
    }
  }

  const generateReport = async () => {
    if (!config.name.trim()) {
      toast({
        title: "Error",
        description: "Please enter a report name",
        variant: "destructive"
      })
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/reports/custom', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(config)
      })

      const data = await response.json()
      
      if (data.success) {
        setReportData(data.data)
        toast({
          title: "Success",
          description: `Report generated with ${data.metadata.totalRecords} records`
        })
      } else {
        throw new Error(data.error)
      }
    } catch (error) {
      console.error('Error generating report:', error)
      toast({
        title: "Error",
        description: "Failed to generate report",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const exportToCSV = () => {
    if (reportData.length === 0) {
      toast({
        title: "Error",
        description: "No data to export",
        variant: "destructive"
      })
      return
    }

    const visibleColumns = config.columns.filter(col => col.visible)
    const headers = visibleColumns.map(col => col.label).join(',')
    
    const rows = reportData.map(row => 
      visibleColumns.map(col => {
        const value = row[col.field]
        if (col.type === 'date' && value) {
          return new Date(value).toLocaleDateString()
        }
        if (col.type === 'currency' && value) {
          return `"${new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(value)}"`
        }
        return `"${value || ''}"`
      }).join(',')
    )

    const csv = [headers, ...rows].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${config.name.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const updateFilter = (filterType: keyof ReportFilter, value: any) => {
    setConfig(prev => ({
      ...prev,
      filters: {
        ...prev.filters,
        [filterType]: value
      }
    }))
  }

  const toggleColumn = (fieldName: string) => {
    setConfig(prev => ({
      ...prev,
      columns: prev.columns.map(col => 
        col.field === fieldName 
          ? { ...col, visible: !col.visible }
          : col
      )
    }))
  }

  const formatValue = (value: any, type: string) => {
    if (value === null || value === undefined) return 'N/A'
    
    switch (type) {
      case 'date':
        return new Date(value).toLocaleDateString()
      case 'currency':
        return new Intl.NumberFormat('id-ID', { 
          style: 'currency', 
          currency: 'IDR',
          minimumFractionDigits: 0
        }).format(value)
      case 'number':
        return typeof value === 'number' ? value.toLocaleString() : value
      case 'status':
        return (
          <Badge variant={
            value === 'HIGH' ? 'destructive' : 
            value === 'MEDIUM' ? 'default' : 
            'secondary'
          }>
            {value}
          </Badge>
        )
      default:
        return value
    }
  }

  if (!schema) {
    return <div className="flex items-center justify-center h-64">Loading...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Custom Report Builder</h1>
          <p className="text-muted-foreground">Create tailored reports with custom filters and layouts</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={generatePreview} disabled={previewLoading}>
            <Eye className="mr-2 h-4 w-4" />
            Preview
          </Button>
          <Button onClick={generateReport} disabled={loading}>
            <Play className="mr-2 h-4 w-4" />
            Generate Report
          </Button>
          {reportData.length > 0 && (
            <Button onClick={exportToCSV} variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Export CSV
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Configuration Panel */}
        <div className="lg:col-span-1 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Report Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="reportName">Report Name *</Label>
                <Input
                  id="reportName"
                  value={config.name}
                  onChange={(e) => setConfig(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter report name"
                />
              </div>
              
              <div>
                <Label htmlFor="reportDescription">Description</Label>
                <Input
                  id="reportDescription"
                  value={config.description}
                  onChange={(e) => setConfig(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Enter description (optional)"
                />
              </div>
            </CardContent>
          </Card>

          <Tabs defaultValue="filters" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="filters">
                <Filter className="h-4 w-4 mr-1" />
                Filters
              </TabsTrigger>
              <TabsTrigger value="columns">
                <Columns className="h-4 w-4 mr-1" />
                Columns
              </TabsTrigger>
              <TabsTrigger value="charts">
                <BarChart3 className="h-4 w-4 mr-1" />
                Charts
              </TabsTrigger>
            </TabsList>

            <TabsContent value="filters" className="space-y-4">
              <Card>
                <CardContent className="pt-6 space-y-4">
                  <div>
                    <Label>Unit Kerja</Label>
                    <Select onValueChange={(value) => {
                      const unitId = parseInt(value)
                      updateFilter('unitKerjaIds', config.filters.unitKerjaIds?.includes(unitId) 
                        ? config.filters.unitKerjaIds.filter(id => id !== unitId)
                        : [...(config.filters.unitKerjaIds || []), unitId]
                      )
                    }}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select unit kerja" />
                      </SelectTrigger>
                      <SelectContent>
                        {schema.availableFilters.unitKerja.map(unit => (
                          <SelectItem key={unit.id} value={unit.id.toString()}>
                            {unit.nama}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {config.filters.unitKerjaIds && config.filters.unitKerjaIds.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {config.filters.unitKerjaIds.map(id => {
                          const unit = schema.availableFilters.unitKerja.find(u => u.id === id)
                          return (
                            <Badge key={id} variant="secondary">
                              {unit?.nama}
                            </Badge>
                          )
                        })}
                      </div>
                    )}
                  </div>

                  <div>
                    <Label>Risk Levels</Label>
                    <div className="space-y-2 mt-2">
                      {schema.availableFilters.riskLevels.map(level => (
                        <div key={level.value} className="flex items-center space-x-2">
                          <Checkbox
                            id={level.value}
                            checked={config.filters.riskLevels?.includes(level.value) || false}
                            onCheckedChange={(checked: boolean) => {
                              if (checked) {
                                updateFilter('riskLevels', [...(config.filters.riskLevels || []), level.value])
                              } else {
                                updateFilter('riskLevels', config.filters.riskLevels?.filter(l => l !== level.value) || [])
                              }
                            }}
                          />
                          <Label htmlFor={level.value}>{level.label}</Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label>Date Range</Label>
                    <div className="flex gap-2 mt-2">
                      <Input
                        type="date"
                        value={config.filters.dateRange?.start || ''}
                        onChange={(e) => updateFilter('dateRange', {
                          ...config.filters.dateRange,
                          start: e.target.value
                        })}
                      />
                      <Input
                        type="date"
                        value={config.filters.dateRange?.end || ''}
                        onChange={(e) => updateFilter('dateRange', {
                          ...config.filters.dateRange,
                          end: e.target.value
                        })}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="columns" className="space-y-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="space-y-2">
                    {config.columns.map(column => (
                      <div key={column.field} className="flex items-center space-x-2">
                        <Checkbox
                          id={column.field}
                          checked={column.visible}
                          onCheckedChange={() => toggleColumn(column.field)}
                        />
                        <Label htmlFor={column.field} className="flex-1">
                          {column.label}
                        </Label>
                        <Badge variant="outline">{column.type}</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="charts" className="space-y-4">
              <Card>
                <CardContent className="pt-6 space-y-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="includeCharts"
                      checked={config.includeCharts}
                      onCheckedChange={(checked: boolean) => 
                        setConfig(prev => ({ ...prev, includeCharts: !!checked }))
                      }
                    />
                    <Label htmlFor="includeCharts">Include Charts</Label>
                  </div>
                  
                  {config.includeCharts && (
                    <div className="space-y-2">
                      {schema.chartTypes.map(chart => (
                        <div key={chart.value} className="flex items-center space-x-2">
                          <Checkbox
                            id={chart.value}
                            checked={config.chartTypes?.includes(chart.value) || false}
                            onCheckedChange={(checked: boolean) => {
                              if (checked) {
                                setConfig(prev => ({
                                  ...prev,
                                  chartTypes: [...(prev.chartTypes || []), chart.value]
                                }))
                              } else {
                                setConfig(prev => ({
                                  ...prev,
                                  chartTypes: prev.chartTypes?.filter(c => c !== chart.value) || []
                                }))
                              }
                            }}
                          />
                          <Label htmlFor={chart.value}>{chart.label}</Label>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Preview/Results Panel */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>
                {reportData.length > 0 ? 'Report Results' : 'Preview'}
                {(reportData.length > 0 || previewData.length > 0) && (
                  <Badge className="ml-2">
                    {reportData.length > 0 ? reportData.length : previewData.length} records
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {previewLoading || loading ? (
                <div className="flex items-center justify-center h-64">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-2"></div>
                    <p>{loading ? 'Generating report...' : 'Loading preview...'}</p>
                  </div>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  {(reportData.length > 0 || previewData.length > 0) ? (
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="border-b">
                          {config.columns.filter(col => col.visible).map(column => (
                            <th key={column.field} className="text-left p-2 font-medium">
                              {column.label}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {(reportData.length > 0 ? reportData : previewData).map((row, index) => (
                          <tr key={index} className="border-b hover:bg-gray-50">
                            {config.columns.filter(col => col.visible).map(column => (
                              <td key={column.field} className="p-2">
                                {formatValue(row[column.field], column.type)}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <div className="text-center py-12 text-muted-foreground">
                      <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>Configure your report and click Preview to see results</p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}