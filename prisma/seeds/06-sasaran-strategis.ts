import { PrismaClient } from '@prisma/client'

export async function seedSasaranStrategis(prisma: PrismaClient) {
  const sasaranData = [
    {
      unitCode: 'OPS',
      sasaran: 'Meningkatkan efisiensi operasional sebesar 15%',
      strategi: 'Implementasi digitalisasi proses bisnis',
      expectedOutcome: 'Peningkatan produktivitas dan pengurangan biaya operasional',
      riskValueTimbul: 8.5,
      limitRisiko: 12.0
    },
    {
      unitCode: 'FIN',
      sasaran: 'Mempertahankan rasio keuangan yang sehat',
      strategi: 'Optimalisasi struktur modal dan manajemen cash flow',
      expectedOutcome: 'Stabilitas keuangan dan profitabilitas berkelanjutan',
      riskValueTimbul: 6.2,
      limitRisiko: 10.0
    },
    {
      unitCode: 'IT',
      sasaran: 'Mencapai uptime sistem 99.9%',
      strategi: 'Upgrade infrastruktur IT dan implementasi backup system',
      expectedOutcome: 'Keandalan sistem yang tinggi dan minimalisasi downtime',
      riskValueTimbul: 7.8,
      limitRisiko: 15.0
    },
    {
      unitCode: 'HR',
      sasaran: 'Menurunkan turnover karyawan menjadi <5%',
      strategi: 'Program pengembangan SDM dan peningkatan kompensasi',
      expectedOutcome: 'Retensi talent dan peningkatan engagement karyawan',
      riskValueTimbul: 5.5,
      limitRisiko: 8.0
    }
  ]

  for (const sasaranItem of sasaranData) {
    // Get unit ID
    const unit = await prisma.unitKerja.findUnique({
      where: { code: sasaranItem.unitCode }
    })
    
    if (!unit) {
      throw new Error(`Unit ${sasaranItem.unitCode} not found`)
    }

    const { unitCode, ...sasaranDataWithoutUnitCode } = sasaranItem
    
    await prisma.sasaranStrategis.create({
      data: {
        ...sasaranDataWithoutUnitCode,
        unitId: unit.id
      }
    })
  }

  console.log(`   ✓ Created ${sasaranData.length} sasaran strategis`)
}