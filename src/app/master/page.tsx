"use client"

import { useState, useEffect, Suspense } from "react"
import { useSession } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DashboardHeader } from "@/components/dashboard-header"
import { TaxonomyMaster } from "@/components/master/taxonomy-master"
import { CriteriaMaster } from "@/components/master/criteria-master"
import { UnitKerjaMaster } from "@/components/master/unit-kerja-master"
import { KRIMaster } from "@/components/master/kri-master"
import { KontrolExistingMaster } from "@/components/master/kontrol-existing-master"
import { RiskTreatmentMaster } from "@/components/master/risk-treatment-master"
import { Loader2, Database, Tag, List, Building, Activity, Shield, Target } from "lucide-react"

function MasterDataContent() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("taxonomy")

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
    } else if (status === "authenticated") {
      setIsLoading(false)
      
      // Check for tab parameter
      const tabParam = searchParams.get("tab")
      if (tabParam) {
        setActiveTab(tabParam)
      }
    }
  }, [status, router, searchParams])

  if (status === "loading" || isLoading) {
    return (
      <>
        <DashboardHeader />
        <div className="container px-4 py-8 mx-auto">
          <div className="max-w-6xl mx-auto">
            <Card>
              <CardContent className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
              </CardContent>
            </Card>
          </div>
        </div>
      </>
    )
  }

  if (status === "unauthenticated") {
    return null
  }

  return (
    <>
      <DashboardHeader />
      <div className="container px-4 py-8 mx-auto">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center space-x-3 text-3xl">
                <Database className="w-8 h-8 text-blue-600" />
                <span>Master Data Management</span>
              </CardTitle>
              <CardDescription>
                Kelola data master untuk sistem manajemen risiko
              </CardDescription>
            </CardHeader>
          </Card>

          {/* Master Data Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="taxonomy" className="flex items-center space-x-2">
                <Tag className="w-4 h-4" />
                <span>Taksonomi</span>
              </TabsTrigger>
              <TabsTrigger value="criteria" className="flex items-center space-x-2">
                <List className="w-4 h-4" />
                <span>Kriteria</span>
              </TabsTrigger>
              <TabsTrigger value="units" className="flex items-center space-x-2">
                <Building className="w-4 h-4" />
                <span>Unit Kerja</span>
              </TabsTrigger>
              <TabsTrigger value="kri" className="flex items-center space-x-2">
                <Activity className="w-4 h-4" />
                <span>KRI</span>
              </TabsTrigger>
              <TabsTrigger value="kontrol" className="flex items-center space-x-2">
                <Shield className="w-4 h-4" />
                <span>Kontrol</span>
              </TabsTrigger>
              <TabsTrigger value="treatment" className="flex items-center space-x-2">
                <Target className="w-4 h-4" />
                <span>Treatment</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="taxonomy">
              <TaxonomyMaster />
            </TabsContent>

            <TabsContent value="criteria">
              <CriteriaMaster />
            </TabsContent>

            <TabsContent value="units">
              <UnitKerjaMaster />
            </TabsContent>

            <TabsContent value="kri">
              <KRIMaster />
            </TabsContent>

            <TabsContent value="kontrol">
              <KontrolExistingMaster />
            </TabsContent>

            <TabsContent value="treatment">
              <RiskTreatmentMaster />
            </TabsContent>
          </Tabs>

          {/* Quick Actions */}
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Actions Lainnya</CardTitle>
              <CardDescription>
                Fitur master data lainnya akan segera tersedia
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <Button variant="outline" disabled className="flex items-center space-x-2">
                  <span>Advanced Reports</span>
                </Button>
                <Button variant="outline" disabled className="flex items-center space-x-2">
                  <span>Data Export/Import</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  )
}

export default function MasterDataPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-64"><Loader2 className="h-8 w-8 animate-spin" /></div>}>
      <MasterDataContent />
    </Suspense>
  )
}