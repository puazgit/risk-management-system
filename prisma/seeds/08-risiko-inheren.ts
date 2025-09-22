import { PrismaClient } from '@prisma/client'

export async function seedRisikoInheren(prisma: PrismaClient) {
  const risikoInherenData = [
    {
      riskNumber: 'RSK-OPS-001',
      inherenDampakValue: 12.5,
      inherenDampakScale: 4, // Tinggi
      inherenProbValue: 0.35,
      inherenProbScale: 3, // Mungkin
      inherenExposure: 50.0, // Calculated: 12.5 * 4
      inherenLevel: 'High',
      penjelasanDampakKualitatif: 'Gangguan produksi dapat menyebabkan kerugian 10-25 Miliar dan mengganggu komitmen kepada pelanggan'
    },
    {
      riskNumber: 'RSK-FIN-001',
      inherenDampakValue: 8.0,
      inherenDampakScale: 3, // Sedang
      inherenProbValue: 0.20,
      inherenProbScale: 2, // Jarang
      inherenExposure: 24.0, // Calculated: 8.0 * 3
      inherenLevel: 'Moderate',
      penjelasanDampakKualitatif: 'Kredit macet dapat menyebabkan kerugian 5-10 Miliar dan mempengaruhi likuiditas'
    },
    {
      riskNumber: 'RSK-IT-001',
      inherenDampakValue: 15.0,
      inherenDampakScale: 5, // Sangat Tinggi
      inherenProbValue: 0.25,
      inherenProbScale: 2, // Jarang
      inherenExposure: 75.0, // Calculated: 15.0 * 5
      inherenLevel: 'Very High',
      penjelasanDampakKualitatif: 'Serangan cyber dapat menyebabkan kerugian >25 Miliar, kebocoran data, dan kerusakan reputasi'
    },
    {
      riskNumber: 'RSK-HR-001',
      inherenDampakValue: 6.0,
      inherenDampakScale: 2, // Rendah
      inherenProbValue: 0.40,
      inherenProbScale: 3, // Mungkin
      inherenExposure: 18.0, // Calculated: 6.0 * 3
      inherenLevel: 'Moderate',
      penjelasanDampakKualitatif: 'Kehilangan talent kunci dapat menyebabkan kerugian 1-5 Miliar dan gangguan operasional'
    },
    {
      riskNumber: 'RSK-OPS-002',
      inherenDampakValue: 10.0,
      inherenDampakScale: 4, // Tinggi
      inherenProbValue: 0.30,
      inherenProbScale: 3, // Mungkin
      inherenExposure: 40.0, // Calculated: 10.0 * 4
      inherenLevel: 'High',
      penjelasanDampakKualitatif: 'Kegagalan supply chain dapat menyebabkan kerugian 10-25 Miliar dan gangguan produksi'
    }
  ]

  for (const inherenItem of risikoInherenData) {
    // Get risiko by riskNumber
    const risiko = await prisma.risiko.findUnique({
      where: { riskNumber: inherenItem.riskNumber }
    })
    
    if (!risiko) {
      throw new Error(`Risiko ${inherenItem.riskNumber} not found`)
    }

    const { riskNumber, ...inherenDataClean } = inherenItem
    
    await prisma.risikoInheren.upsert({
      where: { riskId: risiko.id },
      update: inherenDataClean,
      create: {
        riskId: risiko.id,
        ...inherenDataClean
      }
    })
  }

  console.log(`   ✓ Created ${risikoInherenData.length} risiko inheren`)
}