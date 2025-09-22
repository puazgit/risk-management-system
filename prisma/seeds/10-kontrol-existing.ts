import { PrismaClient } from '@prisma/client'

export async function seedKontrolExisting(prisma: PrismaClient) {
  const kontrolData = [
    {
      riskNumber: 'RSK-OPS-001',
      controls: [
        {
          controlType: 'Preventive',
          deskripsiDampak: 'Sistem backup otomatis untuk mencegah kehilangan data produksi',
          effectivenessRating: 'Effective'
        },
        {
          controlType: 'Detective',
          deskripsiDampak: 'Monitoring real-time sistem produksi dengan alert otomatis',
          effectivenessRating: 'Highly Effective'
        }
      ]
    },
    {
      riskNumber: 'RSK-FIN-001',
      controls: [
        {
          controlType: 'Preventive',
          deskripsiDampak: 'Credit scoring dan assessment mendalam sebelum pemberian kredit',
          effectivenessRating: 'Effective'
        },
        {
          controlType: 'Detective',
          deskripsiDampak: 'Monitoring rutin portfolio kredit dan early warning system',
          effectivenessRating: 'Effective'
        }
      ]
    },
    {
      riskNumber: 'RSK-IT-001',
      controls: [
        {
          controlType: 'Preventive',
          deskripsiDampak: 'Firewall berlapis dan sistem antivirus enterprise',
          effectivenessRating: 'Effective'
        },
        {
          controlType: 'Detective',
          deskripsiDampak: 'Security monitoring 24/7 dan intrusion detection system',
          effectivenessRating: 'Highly Effective'
        },
        {
          controlType: 'Corrective',
          deskripsiDampak: 'Incident response plan dan disaster recovery system',
          effectivenessRating: 'Effective'
        }
      ]
    },
    {
      riskNumber: 'RSK-HR-001',
      controls: [
        {
          controlType: 'Preventive',
          deskripsiDampak: 'Program retention dan career development untuk talent kunci',
          effectivenessRating: 'Partially Effective'
        },
        {
          controlType: 'Detective',
          deskripsiDampak: 'Survey engagement dan exit interview untuk identifikasi risiko',
          effectivenessRating: 'Effective'
        }
      ]
    },
    {
      riskNumber: 'RSK-OPS-002',
      controls: [
        {
          controlType: 'Preventive',
          deskripsiDampak: 'Diversifikasi supplier dan kontrak jangka panjang',
          effectivenessRating: 'Effective'
        },
        {
          controlType: 'Detective',
          deskripsiDampak: 'Monitoring kondisi supplier dan supply chain visibility',
          effectivenessRating: 'Partially Effective'
        }
      ]
    }
  ]

  for (const kontrolGroup of kontrolData) {
    // Get risiko by riskNumber
    const risiko = await prisma.risiko.findUnique({
      where: { riskNumber: kontrolGroup.riskNumber }
    })
    
    if (!risiko) {
      throw new Error(`Risiko ${kontrolGroup.riskNumber} not found`)
    }

    for (const control of kontrolGroup.controls) {
      await prisma.kontrolExisting.create({
        data: {
          riskId: risiko.id,
          ...control
        }
      })
    }
  }

  const totalControls = kontrolData.reduce((sum, group) => sum + group.controls.length, 0)
  console.log(`   ✓ Created ${totalControls} kontrol existing`)
}