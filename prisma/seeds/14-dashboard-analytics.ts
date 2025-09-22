import { PrismaClient } from '@prisma/client'

export async function seedDashboardAnalytics(prisma: PrismaClient) {
  const analyticsData = [
    {
      periode: new Date('2024-09-01'),
      unitId: null, // Organization-wide
      totalRisks: 25,
      highRisks: 8,
      criticalKRIs: 3,
      overdueTreatments: 4,
      riskTrend: "DOWN",
      treatmentProgress: 72.5,
      complianceScore: 88.5,
      heatMapData: JSON.stringify({
        matrix: [
          [0, 1, 2, 1, 0],
          [1, 2, 3, 2, 1],
          [2, 3, 5, 3, 2],
          [1, 2, 3, 2, 1],
          [0, 1, 2, 1, 0]
        ]
      }),
      lastUpdated: new Date('2024-09-01')
    },
    {
      periode: new Date('2024-08-01'),
      unitId: null,
      totalRisks: 23,
      highRisks: 9,
      criticalKRIs: 4,
      overdueTreatments: 6,
      riskTrend: "DOWN",
      treatmentProgress: 65.2,
      complianceScore: 85.2,
      heatMapData: JSON.stringify({
        matrix: [
          [0, 1, 2, 2, 0],
          [1, 3, 4, 3, 1],
          [2, 4, 6, 4, 2],
          [1, 3, 4, 3, 1],
          [0, 1, 2, 2, 0]
        ]
      }),
      lastUpdated: new Date('2024-08-01')
    },
    {
      periode: new Date('2024-07-01'),
      unitId: null,
      totalRisks: 22,
      highRisks: 10,
      criticalKRIs: 5,
      overdueTreatments: 7,
      riskTrend: "DOWN",
      treatmentProgress: 63.6,
      complianceScore: 82.7,
      heatMapData: JSON.stringify({
        matrix: [
          [0, 2, 3, 2, 0],
          [2, 3, 5, 3, 2],
          [3, 5, 7, 5, 3],
          [2, 3, 5, 3, 2],
          [0, 2, 3, 2, 0]
        ]
      }),
      lastUpdated: new Date('2024-07-01')
    },
    {
      periode: new Date('2024-06-01'),
      unitId: null,
      totalRisks: 21,
      highRisks: 11,
      criticalKRIs: 6,
      overdueTreatments: 8,
      riskTrend: "UP",
      treatmentProgress: 57.1,
      complianceScore: 79.3,
      heatMapData: JSON.stringify({
        matrix: [
          [1, 2, 3, 3, 1],
          [2, 4, 6, 4, 2],
          [3, 6, 8, 6, 3],
          [2, 4, 6, 4, 2],
          [1, 2, 3, 3, 1]
        ]
      }),
      lastUpdated: new Date('2024-06-01')
    },
    {
      periode: new Date('2024-05-01'),
      unitId: null,
      totalRisks: 20,
      highRisks: 12,
      criticalKRIs: 7,
      overdueTreatments: 9,
      riskTrend: "UP",
      treatmentProgress: 50.0,
      complianceScore: 76.8,
      heatMapData: JSON.stringify({
        matrix: [
          [1, 3, 4, 3, 1],
          [3, 5, 7, 5, 3],
          [4, 7, 9, 7, 4],
          [3, 5, 7, 5, 3],
          [1, 3, 4, 3, 1]
        ]
      }),
      lastUpdated: new Date('2024-05-01')
    },
    {
      periode: new Date('2024-04-01'),
      unitId: null,
      totalRisks: 19,
      highRisks: 13,
      criticalKRIs: 8,
      overdueTreatments: 10,
      riskTrend: "UP",
      treatmentProgress: 42.1,
      complianceScore: 74.1,
      heatMapData: JSON.stringify({
        matrix: [
          [2, 3, 5, 4, 2],
          [3, 6, 8, 6, 3],
          [5, 8, 10, 8, 5],
          [3, 6, 8, 6, 3],
          [2, 3, 5, 4, 2]
        ]
      }),
      lastUpdated: new Date('2024-04-01')
    }
  ]

  for (const analytics of analyticsData) {
    const existing = await prisma.dashboardAnalytics.findFirst({
      where: { 
        periode: analytics.periode,
        unitId: analytics.unitId
      }
    })

    if (!existing) {
      await prisma.dashboardAnalytics.create({
        data: analytics
      })
      console.log(`✅ Created analytics for period ${analytics.periode.toISOString().slice(0, 7)}`)
    } else {
      console.log(`⚠️ Analytics already exists for period ${analytics.periode.toISOString().slice(0, 7)}`)
    }
  }
}