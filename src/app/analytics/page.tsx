"use client"

import { DashboardHeader } from "@/components/dashboard-header"
import { AdvancedAnalyticsDashboard } from "@/components/analytics/advanced-analytics-dashboard"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function AnalyticsPage() {
  return (
    <>
      <DashboardHeader />
      <div className="container px-4 py-8 mx-auto">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="text-3xl flex items-center space-x-3">
                <span>📊</span>
                <span>Risk Analytics Dashboard</span>
              </CardTitle>
              <CardDescription>
                Advanced reporting and analytics for comprehensive risk management insights
              </CardDescription>
            </CardHeader>
          </Card>

          {/* Advanced Analytics Dashboard */}
          <AdvancedAnalyticsDashboard />
        </div>
      </div>
    </>
  )
}