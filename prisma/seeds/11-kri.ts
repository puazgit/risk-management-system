import { PrismaClient } from '@prisma/client'

export async function seedKRI(prisma: PrismaClient) {
  // First get some risks to associate KRIs with
  const risks = await prisma.risiko.findMany()

  if (risks.length === 0) {
    console.log('⚠️ No risks found, skipping KRI seeding')
    return
  }

  const kriData = [
    {
      riskId: risks[0]?.id || 1,
      indicatorName: "Customer Satisfaction Index",
      unitSatuan: "Percentage",
      thresholdCategory: "HIGH",
      thresholdValue: 85.0
    },
    {
      riskId: risks[1]?.id || 2,
      indicatorName: "System Downtime Hours",
      unitSatuan: "Hours",
      thresholdCategory: "LOW",
      thresholdValue: 2.0
    },
    {
      riskId: risks[2]?.id || 3,
      indicatorName: "Credit Loss Rate",
      unitSatuan: "Percentage",
      thresholdCategory: "MEDIUM",
      thresholdValue: 1.5
    },
    {
      riskId: risks[3]?.id || 4,
      indicatorName: "Employee Turnover Rate",
      unitSatuan: "Percentage",
      thresholdCategory: "MEDIUM",
      thresholdValue: 8.0
    },
    {
      riskId: risks[4]?.id || 5,
      indicatorName: "IT Security Incidents",
      unitSatuan: "Count",
      thresholdCategory: "LOW",
      thresholdValue: 0.0
    }
  ]

  // Only create KRIs for existing risks
  const validKriData = kriData.filter((_, index) => index < risks.length)

  for (const kri of validKriData) {
    const existing = await prisma.kRI.findFirst({
      where: { 
        riskId: kri.riskId,
        indicatorName: kri.indicatorName 
      }
    })

    if (!existing) {
      await prisma.kRI.create({
        data: kri
      })
      console.log(`✅ Created KRI: ${kri.indicatorName}`)
    } else {
      console.log(`⚠️ KRI already exists: ${kri.indicatorName}`)
    }
  }
}