import { PrismaClient } from '@prisma/client'

export async function seedRisiko(prisma: PrismaClient) {
  const risikoData = [
    {
      riskNumber: 'RSK-OPS-001',
      namaRisiko: 'Gangguan Sistem Produksi',
      deskripsi: 'Risiko terjadinya gangguan pada sistem produksi utama yang dapat menyebabkan penurunan output dan kerugian finansial',
      sasaranUnitCode: 'OPS',
      kategoriId: 2, // Risiko Operasional - Proses Bisnis
      ownerUnitCode: 'OPS'
    },
    {
      riskNumber: 'RSK-FIN-001',
      namaRisiko: 'Risiko Kredit Macet',
      deskripsi: 'Risiko kerugian akibat kegagalan bayar dari pelanggan atau mitra bisnis',
      sasaranUnitCode: 'FIN',
      kategoriId: 5, // Risiko Keuangan - Kredit
      ownerUnitCode: 'FIN'
    },
    {
      riskNumber: 'RSK-IT-001',
      namaRisiko: 'Serangan Cyber Security',
      deskripsi: 'Risiko serangan siber yang dapat mengganggu operasional dan menyebabkan kebocoran data',
      sasaranUnitCode: 'IT',
      kategoriId: 4, // Risiko Operasional - TI
      ownerUnitCode: 'IT'
    },
    {
      riskNumber: 'RSK-HR-001',
      namaRisiko: 'Kehilangan Talent Kunci',
      deskripsi: 'Risiko kehilangan karyawan dengan keahlian kritis yang dapat mengganggu kontinuitas bisnis',
      sasaranUnitCode: 'HR',
      kategoriId: 3, // Risiko Operasional - SDM
      ownerUnitCode: 'HR'
    },
    {
      riskNumber: 'RSK-OPS-002',
      namaRisiko: 'Kegagalan Supply Chain',
      deskripsi: 'Risiko gangguan pada rantai pasokan utama yang dapat menghentikan operasional',
      sasaranUnitCode: 'OPS',
      kategoriId: 2, // Risiko Operasional - Proses Bisnis
      ownerUnitCode: 'OPS'
    }
  ]

  for (const risikoItem of risikoData) {
    // Get owner unit
    const ownerUnit = await prisma.unitKerja.findUnique({
      where: { code: risikoItem.ownerUnitCode }
    })
    
    if (!ownerUnit) {
      throw new Error(`Owner unit ${risikoItem.ownerUnitCode} not found`)
    }

    // Get sasaran strategis by unit
    const sasaranUnit = await prisma.unitKerja.findUnique({
      where: { code: risikoItem.sasaranUnitCode }
    })
    
    if (!sasaranUnit) {
      throw new Error(`Sasaran unit ${risikoItem.sasaranUnitCode} not found`)
    }

    const sasaran = await prisma.sasaranStrategis.findFirst({
      where: { unitId: sasaranUnit.id }
    })
    
    if (!sasaran) {
      throw new Error(`Sasaran strategis for unit ${risikoItem.sasaranUnitCode} not found`)
    }

    const { sasaranUnitCode, ownerUnitCode, ...risikoDataClean } = risikoItem
    
    await prisma.risiko.upsert({
      where: { riskNumber: risikoItem.riskNumber },
      update: {
        ...risikoDataClean,
        sasaranId: sasaran.id,
        ownerUnitId: ownerUnit.id
      },
      create: {
        ...risikoDataClean,
        sasaranId: sasaran.id,
        ownerUnitId: ownerUnit.id
      }
    })
  }

  console.log(`   ✓ Created ${risikoData.length} risiko`)
}