import { PrismaClient } from '@prisma/client'

export async function seedUsers(prisma: PrismaClient) {
  const usersData = [
    {
      username: 'admin',
      name: 'Administrator System',
      email: 'admin@risikoapp.com',
      unitCode: 'MR',
      role: 'Admin'
    },
    {
      username: 'direktur.mr',
      name: 'Direktur Manajemen Risiko',
      email: 'direktur.mr@risikoapp.com',
      unitCode: 'DIR',
      role: 'Direktur'
    },
    {
      username: 'manager.mr',
      name: 'Manager Manajemen Risiko',
      email: 'manager.mr@risikoapp.com',
      unitCode: 'MR',
      role: 'RiskManager'
    },
    {
      username: 'risk.owner.ops',
      name: 'Risk Owner Operasional',
      email: 'risk.owner.ops@risikoapp.com',
      unitCode: 'OPS',
      role: 'RiskOwner'
    },
    {
      username: 'risk.owner.fin',
      name: 'Risk Owner Keuangan',
      email: 'risk.owner.fin@risikoapp.com',
      unitCode: 'FIN',
      role: 'RiskOwner'
    },
    {
      username: 'auditor.spi',
      name: 'Auditor SPI',
      email: 'auditor.spi@risikoapp.com',
      unitCode: 'SPI',
      role: 'Auditor'
    }
  ]

  for (const userData of usersData) {
    // Get unit ID
    const unit = await prisma.unitKerja.findUnique({
      where: { code: userData.unitCode }
    })
    
    if (!unit) {
      throw new Error(`Unit ${userData.unitCode} not found`)
    }

    const { unitCode, ...userDataWithoutUnitCode } = userData
    
    await prisma.user.upsert({
      where: { username: userData.username },
      update: {
        ...userDataWithoutUnitCode,
        unitId: unit.id
      },
      create: {
        ...userDataWithoutUnitCode,
        unitId: unit.id
      }
    })
  }

  console.log(`   ✓ Created ${usersData.length} users`)
}