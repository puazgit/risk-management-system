import { PrismaClient } from '@prisma/client'

export async function seedPerlakuanRisiko(prisma: PrismaClient) {
  // Get some risks to associate treatments with
  const risks = await prisma.risiko.findMany()
  const users = await prisma.user.findMany()

  if (risks.length === 0 || users.length === 0) {
    console.log('⚠️ No risks or users found, skipping perlakuan risiko seeding')
    return
  }

  const treatmentData = [
    {
      riskId: risks[0]?.id || 1,
      picId: users[0]?.id || 1,
      treatmentOption: "MITIGATE",
      treatmentPlan: "Implementasi sistem customer feedback real-time dan peningkatan training customer service",
      output: "Peningkatan customer satisfaction index dari 75% menjadi 85%",
      costRupiah: 500000000.0,
      timelineMonths: 6,
      rkapProgramType: "IMPROVEMENT"
    },
    {
      riskId: risks[1]?.id || 2,
      picId: users[1]?.id || 2,
      treatmentOption: "MITIGATE",
      treatmentPlan: "Upgrade infrastruktur server dan implementasi sistem monitoring 24/7",
      output: "Pengurangan system downtime dari 8 jam menjadi 2 jam per bulan",
      costRupiah: 2000000000.0,
      timelineMonths: 4,
      rkapProgramType: "INVESTMENT"
    },
    {
      riskId: risks[2]?.id || 3,
      picId: users[2]?.id || 3,
      treatmentOption: "MITIGATE",
      treatmentPlan: "Perbaikan sistem credit scoring dan pengetatan prosedur due diligence",
      output: "Penurunan credit loss rate dari 3% menjadi 1.5%",
      costRupiah: 1500000000.0,
      timelineMonths: 8,
      rkapProgramType: "OPERATIONAL"
    },
    {
      riskId: risks[3]?.id || 4,
      picId: users[3]?.id || 4,
      treatmentOption: "ACCEPT",
      treatmentPlan: "Monitoring tingkat turnover dan perbaikan program employee engagement",
      output: "Mempertahankan employee turnover rate di bawah 12%",
      costRupiah: 750000000.0,
      timelineMonths: 12,
      rkapProgramType: "HR_DEVELOPMENT"
    },
    {
      riskId: risks[4]?.id || 5,
      picId: users[4]?.id || 5,
      treatmentOption: "MITIGATE",
      treatmentPlan: "Implementasi advanced security tools dan security awareness training",
      output: "Penurunan security incidents dari 5 menjadi 0 per bulan",
      costRupiah: 1200000000.0,
      timelineMonths: 3,
      rkapProgramType: "SECURITY"
    }
  ]

  // Only create treatments for existing risks and users
  const validTreatmentData = treatmentData.filter((_, index) => 
    index < risks.length && index < users.length
  )

  for (const treatment of validTreatmentData) {
    const existing = await prisma.perlakuanRisiko.findFirst({
      where: { 
        riskId: treatment.riskId,
        treatmentPlan: treatment.treatmentPlan
      }
    })

    if (!existing) {
      await prisma.perlakuanRisiko.create({
        data: treatment
      })
      console.log(`✅ Created treatment for risk ID ${treatment.riskId}`)
    } else {
      console.log(`⚠️ Treatment already exists for risk ID ${treatment.riskId}`)
    }
  }
}