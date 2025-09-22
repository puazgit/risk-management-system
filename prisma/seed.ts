import { PrismaClient } from '@prisma/client'
import { seedAuthUsers } from './seeds/00-auth-users'
import { seedUnitKerja } from './seeds/01-unit-kerja'
import { seedUsers } from './seeds/02-users'
import { seedTaksonomiRisiko } from './seeds/03-taksonomi-risiko'
import { seedKriteriaRisiko } from './seeds/04-kriteria-risiko'
import { seedStrategiRisiko } from './seeds/05-strategi-risiko'
import { seedSasaranStrategis } from './seeds/06-sasaran-strategis'
import { seedRisiko } from './seeds/07-risiko'
import { seedRisikoInheren } from './seeds/08-risiko-inheren'
import { seedRisikoResidual } from './seeds/09-risiko-residual'
import { seedKontrolExisting } from './seeds/10-kontrol-existing'
import { seedKRI } from './seeds/11-kri'
import { seedPerlakuanRisiko } from './seeds/12-perlakuan-risiko'
import { seedRealisasiPerlakuanRisiko } from './seeds/13-realisasi-perlakuan'
import { seedDashboardAnalytics } from './seeds/14-dashboard-analytics'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seeding...')

  try {
    // 0. Seed Auth Users (for authentication)
    console.log('🔐 Seeding Auth Users...')
    await seedAuthUsers(prisma)

    // 1. Seed Unit Kerja (base organization structure)
    console.log('📊 Seeding Unit Kerja...')
    await seedUnitKerja(prisma)

    // 2. Seed Users
    console.log('👥 Seeding Users...')
    await seedUsers(prisma)

    // 3. Seed Master Data - Taksonomi Risiko
    console.log('📋 Seeding Taksonomi Risiko...')
    await seedTaksonomiRisiko(prisma)

    // 4. Seed Master Data - Kriteria Risiko
    console.log('📏 Seeding Kriteria Risiko...')
    await seedKriteriaRisiko(prisma)

    // 5. Seed Strategi Risiko
    console.log('🎯 Seeding Strategi Risiko...')
    await seedStrategiRisiko(prisma)

    // 6. Seed Sasaran Strategis
    console.log('🎪 Seeding Sasaran Strategis...')
    await seedSasaranStrategis(prisma)

    // 7. Seed Risiko
    console.log('⚠️ Seeding Risiko...')
    await seedRisiko(prisma)

    // 8. Seed Risiko Inheren
    console.log('📈 Seeding Risiko Inheren...')
    await seedRisikoInheren(prisma)

    // 9. Seed Risiko Residual
    console.log('📉 Seeding Risiko Residual...')
    await seedRisikoResidual(prisma)

    // 10. Seed Kontrol Existing
    console.log('🛡️ Seeding Kontrol Existing...')
    await seedKontrolExisting(prisma)

    // 11. Seed KRI (Key Risk Indicators)
    console.log('📊 Seeding KRI...')
    await seedKRI(prisma)

    // 12. Seed Perlakuan Risiko (Risk Treatment)
    console.log('⚡ Seeding Perlakuan Risiko...')
    await seedPerlakuanRisiko(prisma)

    // 13. Seed Realisasi Perlakuan Risiko
    console.log('📈 Seeding Realisasi Perlakuan...')
    await seedRealisasiPerlakuanRisiko(prisma)

    // 14. Seed Dashboard Analytics
    console.log('📊 Seeding Dashboard Analytics...')
    await seedDashboardAnalytics(prisma)

    console.log('✅ Database seeding completed successfully!')
  } catch (error) {
    console.error('❌ Error during seeding:', error)
    throw error
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })