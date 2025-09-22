import { PrismaClient } from '@prisma/client'
import bcryptjs from 'bcryptjs'

export async function seedAuthUsers(prisma: PrismaClient) {
  const authUsersData = [
    {
      name: 'Admin User',
      email: 'admin@test.com',
      password: 'admin123',
      role: 'ADMIN'
    },
    {
      name: 'Test User',
      email: 'test@test.com',
      password: 'test123',
      role: 'USER'
    },
    {
      name: 'Risk Manager',
      email: 'risk@test.com',
      password: 'risk123',
      role: 'RISK_OWNER'
    }
  ]

  console.log('🔐 Seeding Auth Users...')

  for (const userData of authUsersData) {
    const hashedPassword = await bcryptjs.hash(userData.password, 12)
    
    const existingUser = await prisma.authUser.findUnique({
      where: { email: userData.email }
    })

    if (!existingUser) {
      await prisma.authUser.create({
        data: {
          name: userData.name,
          email: userData.email,
          password: hashedPassword,
          role: userData.role as any,
        }
      })
      console.log(`✅ Created auth user: ${userData.email} (password: ${userData.password})`)
    } else {
      console.log(`⚠️  Auth user already exists: ${userData.email}`)
    }
  }

  console.log('✅ Auth Users seeding completed!')
}