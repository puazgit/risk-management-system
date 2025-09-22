import { PrismaClient } from '@prisma/client'

export async function seedRisikoResidual(prisma: PrismaClient) {
  const risikoResidualData = [
    {
      riskNumber: 'RSK-OPS-001',
      residualDampakValue: 8.0,
      residualDampakScale: 3, // Sedang (turun dari Tinggi)
      residualProbValue: 0.20,
      residualProbScale: 2, // Jarang (turun dari Mungkin)
      residualExposure: 24.0, // Calculated: 8.0 * 3
      residualLevel: 'Moderate',
      targetResidual: 'Low'
    },
    {
      riskNumber: 'RSK-FIN-001',
      residualDampakValue: 5.0,
      residualDampakScale: 2, // Rendah (turun dari Sedang)
      residualProbValue: 0.15,
      residualProbScale: 2, // Jarang (tetap)
      residualExposure: 10.0, // Calculated: 5.0 * 2
      residualLevel: 'Low',
      targetResidual: 'Very Low'
    },
    {
      riskNumber: 'RSK-IT-001',
      residualDampakValue: 10.0,
      residualDampakScale: 4, // Tinggi (turun dari Sangat Tinggi)
      residualProbValue: 0.15,
      residualProbScale: 1, // Sangat Jarang (turun dari Jarang)
      residualExposure: 40.0, // Calculated: 10.0 * 4
      residualLevel: 'Moderate',
      targetResidual: 'Low'
    },
    {
      riskNumber: 'RSK-HR-001',
      residualDampakValue: 4.0,
      residualDampakScale: 2, // Rendah (tetap)
      residualProbValue: 0.25,
      residualProbScale: 2, // Jarang (turun dari Mungkin)
      residualExposure: 8.0, // Calculated: 4.0 * 2
      residualLevel: 'Low',
      targetResidual: 'Very Low'
    },
    {
      riskNumber: 'RSK-OPS-002',
      residualDampakValue: 7.0,
      residualDampakScale: 3, // Sedang (turun dari Tinggi)
      residualProbValue: 0.20,
      residualProbScale: 2, // Jarang (turun dari Mungkin)
      residualExposure: 21.0, // Calculated: 7.0 * 3
      residualLevel: 'Moderate',
      targetResidual: 'Low'
    }
  ]

  for (const residualItem of risikoResidualData) {
    // Get risiko by riskNumber
    const risiko = await prisma.risiko.findUnique({
      where: { riskNumber: residualItem.riskNumber }
    })
    
    if (!risiko) {
      throw new Error(`Risiko ${residualItem.riskNumber} not found`)
    }

    const { riskNumber, ...residualDataClean } = residualItem
    
    await prisma.risikoResidual.upsert({
      where: { riskId: risiko.id },
      update: residualDataClean,
      create: {
        riskId: risiko.id,
        ...residualDataClean
      }
    })
  }

  console.log(`   ✓ Created ${risikoResidualData.length} risiko residual`)
}