import { PrismaClient } from '@prisma/client'

export async function seedStrategiRisiko(prisma: PrismaClient) {
  const strategiData = [
    {
      name: 'Risk Appetite Statement 2024',
      description: 'Toleransi risiko perusahaan untuk tahun 2024',
      nilaiAmbang: 15.0
    },
    {
      name: 'Strategi Mitigasi Risiko Operasional',
      description: 'Strategi khusus untuk mengelola risiko operasional',
      nilaiAmbang: 12.0
    },
    {
      name: 'Strategi Pengelolaan Risiko Keuangan',
      description: 'Framework pengelolaan risiko keuangan',
      nilaiAmbang: 10.0
    }
  ]

  for (const [index, strategi] of strategiData.entries()) {
    await prisma.strategiRisiko.upsert({
      where: { id: index + 1 },
      update: strategi,
      create: {
        id: index + 1,
        ...strategi
      }
    })
  }

  console.log(`   ✓ Created ${strategiData.length} strategi risiko`)
}