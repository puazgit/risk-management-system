import { PrismaClient } from '@prisma/client'

export async function seedTaksonomiRisiko(prisma: PrismaClient) {
  const taksonomiData = [
    {
      categoryBUMN: 'Risiko Strategis',
      categoryT2T3KBUMN: 'Risiko Korporat',
      description: 'Risiko yang terkait dengan strategi perusahaan'
    },
    {
      categoryBUMN: 'Risiko Operasional',
      categoryT2T3KBUMN: 'Risiko Proses Bisnis',
      description: 'Risiko yang timbul dari proses operasional'
    },
    {
      categoryBUMN: 'Risiko Operasional',
      categoryT2T3KBUMN: 'Risiko Sumber Daya Manusia',
      description: 'Risiko terkait dengan pengelolaan SDM'
    },
    {
      categoryBUMN: 'Risiko Operasional',
      categoryT2T3KBUMN: 'Risiko Teknologi Informasi',
      description: 'Risiko terkait dengan sistem dan teknologi'
    },
    {
      categoryBUMN: 'Risiko Keuangan',
      categoryT2T3KBUMN: 'Risiko Kredit',
      description: 'Risiko kerugian akibat kegagalan pihak lain'
    },
    {
      categoryBUMN: 'Risiko Keuangan',
      categoryT2T3KBUMN: 'Risiko Likuiditas',
      description: 'Risiko ketidakmampuan memenuhi kewajiban'
    },
    {
      categoryBUMN: 'Risiko Keuangan',
      categoryT2T3KBUMN: 'Risiko Pasar',
      description: 'Risiko perubahan kondisi pasar'
    },
    {
      categoryBUMN: 'Risiko Kepatuhan',
      categoryT2T3KBUMN: 'Risiko Regulasi',
      description: 'Risiko pelanggaran terhadap peraturan'
    },
    {
      categoryBUMN: 'Risiko Reputasi',
      categoryT2T3KBUMN: 'Risiko Citra Perusahaan',
      description: 'Risiko kerusakan reputasi perusahaan'
    }
  ]

  for (const [index, taksonomi] of taksonomiData.entries()) {
    await prisma.taksonomiRisiko.upsert({
      where: { id: index + 1 },
      update: taksonomi,
      create: {
        id: index + 1,
        ...taksonomi
      }
    })
  }

  console.log(`   ✓ Created ${taksonomiData.length} taksonomi risiko`)
}