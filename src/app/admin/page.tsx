"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Users, Shield, UserCheck, Activity, Settings } from "lucide-react"

interface AdminStatsResponse {
  totalUsers: number
  usersByRole: Array<{
    role: string
    count: number
  }>
  recentUsers: Array<{
    id: string
    name: string
    email: string
    role: string
    createdAt: string
  }>
}

function StatsCard({ 
  title, 
  value, 
  description, 
  icon: Icon 
}: { 
  title: string
  value: string | number
  description: string
  icon: any
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="w-4 h-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  )
}

function RoleCard({ role, count }: { role: string; count: number }) {
  const getRoleColor = (role: string) => {
    switch (role) {
      case 'ADMIN': return 'destructive'
      case 'RISK_OWNER': return 'default'
      case 'LINI_KEDUA': return 'secondary'
      case 'SPI': return 'outline'
      case 'DIREKSI': return 'default'
      case 'DEWAN_PENGAWAS': return 'secondary'
      default: return 'outline'
    }
  }

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'RISK_OWNER': return 'Risk Owner'
      case 'LINI_KEDUA': return 'Lini Kedua'
      case 'DEWAN_PENGAWAS': return 'Dewan Pengawas'
      default: return role.charAt(0) + role.slice(1).toLowerCase()
    }
  }

  return (
    <div className="flex items-center justify-between p-3 border rounded-lg">
      <div className="flex items-center gap-2">
        <Badge variant={getRoleColor(role)}>
          {getRoleLabel(role)}
        </Badge>
      </div>
      <span className="text-sm font-medium">{count} users</span>
    </div>
  )
}

function AdminDashboardContent() {
  const [stats, setStats] = useState<AdminStatsResponse>({
    totalUsers: 0,
    usersByRole: [],
    recentUsers: []
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchAdminStats() {
      try {
        const response = await fetch('/api/admin/stats')
        
        if (!response.ok) {
          throw new Error('Failed to fetch admin stats')
        }
        
        const data = await response.json()
        setStats(data)
      } catch (error) {
        console.error('Error fetching admin stats:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchAdminStats()
  }, [])

  if (isLoading) {
    return <LoadingSkeleton />
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Users"
          value={stats.totalUsers}
          description="All registered users"
          icon={Users}
        />
        <StatsCard
          title="Admin Users"
          value={stats.usersByRole.find(item => item.role === 'ADMIN')?.count || 0}
          description="System administrators"
          icon={Shield}
        />
        <StatsCard
          title="Active Roles"
          value={stats.usersByRole.length}
          description="Different user roles"
          icon={UserCheck}
        />
        <StatsCard
          title="Recent Activity"
          value={stats.recentUsers.length}
          description="New users this month"
          icon={Activity}
        />
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>
            Common administrative tasks
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Button asChild className="h-auto p-4 flex flex-col items-center space-y-2">
              <Link href="/admin/users">
                <Users className="w-6 h-6" />
                <div className="text-center">
                  <div className="font-medium">Manage Users</div>
                  <div className="text-xs opacity-70">
                    Add, edit, delete users
                  </div>
                </div>
              </Link>
            </Button>
            
            <Button variant="outline" className="h-auto p-4 flex flex-col items-center space-y-2" disabled>
              <Settings className="w-6 h-6" />
              <div className="text-center">
                <div className="font-medium">System Settings</div>
                <div className="text-xs opacity-70">
                  Coming soon
                </div>
              </div>
            </Button>
            
            <Button variant="outline" className="h-auto p-4 flex flex-col items-center space-y-2" disabled>
              <Activity className="w-6 h-6" />
              <div className="text-center">
                <div className="font-medium">Activity Logs</div>
                <div className="text-xs opacity-70">
                  Coming soon
                </div>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Users by Role */}
        <Card>
          <CardHeader>
            <CardTitle>Users by Role</CardTitle>
            <CardDescription>
              Distribution of users across different roles
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {stats.usersByRole.map((item) => (
              <RoleCard key={item.role} role={item.role} count={item.count} />
            ))}
          </CardContent>
        </Card>

        {/* Recent Users */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Users</CardTitle>
            <CardDescription>
              Latest registered users
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.recentUsers.length > 0 ? (
                stats.recentUsers.map((user: any) => (
                  <div key={user.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{user.name}</p>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                    </div>
                    <div className="text-right">
                      <Badge variant="outline">
                        {user.role === 'RISK_OWNER' ? 'Risk Owner' :
                         user.role === 'LINI_KEDUA' ? 'Lini Kedua' :
                         user.role === 'DEWAN_PENGAWAS' ? 'Dewan Pengawas' :
                         user.role.charAt(0) + user.role.slice(1).toLowerCase()}
                      </Badge>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="py-4 text-sm text-center text-muted-foreground">
                  No recent users found
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      {/* Stats Cards Skeleton */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <div className="w-20 h-4 rounded bg-muted animate-pulse" />
              <div className="w-4 h-4 rounded bg-muted animate-pulse" />
            </CardHeader>
            <CardContent>
              <div className="w-16 h-8 mb-2 rounded bg-muted animate-pulse" />
              <div className="w-24 h-3 rounded bg-muted animate-pulse" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Content Skeleton */}
      <div className="grid gap-6 md:grid-cols-2">
        {[1, 2].map((i) => (
          <Card key={i}>
            <CardHeader>
              <div className="w-32 h-6 mb-2 rounded bg-muted animate-pulse" />
              <div className="w-48 h-4 rounded bg-muted animate-pulse" />
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[1, 2, 3].map((j) => (
                  <div key={j} className="h-12 rounded bg-muted animate-pulse" />
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

export default function AdminDashboard() {
  return (
    <div className="container py-6 mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground">
          Overview of system statistics and user management
        </p>
      </div>

      <AdminDashboardContent />
    </div>
  )
}