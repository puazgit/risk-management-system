import { PrismaClient } from '@prisma/client'

export async function seedUnitKerja(prisma: PrismaClient) {
  const unitKerjaData = [
    {
      code: 'DIR',
      name: 'Direksi',
      hierarchyLevel: 'Lini Kedua'
    },
    {
      code: 'MR',
      name: 'Manajemen Risiko',
      hierarchyLevel: 'Lini Kedua'
    },
    {
      code: 'SPI',
      name: 'Satuan Pengawasan Internal',
      hierarchyLevel: 'Lini Ketiga'
    },
    {
      code: 'OPS',
      name: 'Operasional',
      hierarchyLevel: 'Lini Pertama'
    },
    {
      code: 'FIN',
      name: 'Keuangan',
      hierarchyLevel: 'Lini Pertama'
    },
    {
      code: 'HR',
      name: 'Sumber Daya Manusia',
      hierarchyLevel: 'Lini Pertama'
    },
    {
      code: 'IT',
      name: 'Teknologi Informasi',
      hierarchyLevel: 'Lini Pertama'
    }
  ]

  for (const unit of unitKerjaData) {
    await prisma.unitKerja.upsert({
      where: { code: unit.code },
      update: unit,
      create: unit
    })
  }

  console.log(`   ✓ Created ${unitKerjaData.length} unit kerja`)
}