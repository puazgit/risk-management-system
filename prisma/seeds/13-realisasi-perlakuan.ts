import { PrismaClient } from '@prisma/client'

export async function seedRealisasiPerlakuanRisiko(prisma: PrismaClient) {
  // Get existing treatment plans
  const treatments = await prisma.perlakuanRisiko.findMany()

  if (treatments.length === 0) {
    console.log('⚠️ No treatment plans found, skipping realisasi seeding')
    return
  }

  // Create realisasi for each treatment
  for (let i = 0; i < treatments.length; i++) {
    const treatment = treatments[i]
    
    const realisasiData = {
      perlakuanId: treatment.id,
      periode: new Date('2024-09-30'),
      realisasiKRI: 78.5 + (i * 2), // Varying values
      realisasiRencana: `Implementasi treatment untuk risk ${treatment.riskId} sedang berjalan`,
      realisasiOutput: `Progress implementasi mencapai ${65 + (i * 5)}%`,
      realisasiBiaya: treatment.costRupiah ? treatment.costRupiah * 0.65 : 500000000.0,
      persentaseSerapan: 65.0 + (i * 5),
      status: i === 2 ? "COMPLETED" : i === 1 ? "DELAYED" : "ON_TRACK",
      progress: `${65 + (i * 5)}% - Implementation in progress`
    }

    const existing = await prisma.realisasiPerlakuanRisiko.findFirst({
      where: { 
        perlakuanId: treatment.id,
        periode: realisasiData.periode
      }
    })

    if (!existing) {
      await prisma.realisasiPerlakuanRisiko.create({
        data: realisasiData
      })
      console.log(`✅ Created realisasi for treatment ID ${treatment.id}`)
    } else {
      console.log(`⚠️ Realisasi already exists for treatment ID ${treatment.id}`)
    }
  }
}