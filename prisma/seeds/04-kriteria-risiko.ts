import { PrismaClient } from '@prisma/client'

export async function seedKriteriaRisiko(prisma: PrismaClient) {
  const kriteriaData = [
    // Kriteria Dampak
    {
      type: 'Dampak',
      scale: 'Sangat Rendah',
      value: 1,
      description: 'Dampak finansial < 1 Miliar'
    },
    {
      type: 'Dampak',
      scale: 'Rendah',
      value: 2,
      description: 'Dampak finansial 1-5 Miliar'
    },
    {
      type: 'Dampak',
      scale: 'Sedang',
      value: 3,
      description: 'Dampak finansial 5-10 Miliar'
    },
    {
      type: 'Dampak',
      scale: 'Tinggi',
      value: 4,
      description: 'Dampak finansial 10-25 Miliar'
    },
    {
      type: 'Dampak',
      scale: 'Sangat Tinggi',
      value: 5,
      description: 'Dampak finansial > 25 Miliar'
    },
    // Kriteria Probabilitas
    {
      type: 'Probabilitas',
      scale: 'Sangat Jarang',
      value: 1,
      description: 'Kemungkinan terjadi < 5%'
    },
    {
      type: 'Probabilitas',
      scale: 'Jarang',
      value: 2,
      description: 'Kemungkinan terjadi 5-25%'
    },
    {
      type: 'Probabilitas',
      scale: 'Mungkin',
      value: 3,
      description: 'Kemungkinan terjadi 25-50%'
    },
    {
      type: 'Probabilitas',
      scale: 'Sering',
      value: 4,
      description: 'Kemungkinan terjadi 50-75%'
    },
    {
      type: 'Probabilitas',
      scale: 'Hampir Pasti',
      value: 5,
      description: 'Kemungkinan terjadi > 75%'
    }
  ]

  for (const [index, kriteria] of kriteriaData.entries()) {
    await prisma.kriteriaRisiko.upsert({
      where: { id: index + 1 },
      update: kriteria,
      create: {
        id: index + 1,
        ...kriteria
      }
    })
  }

  console.log(`   ✓ Created ${kriteriaData.length} kriteria risiko`)
}