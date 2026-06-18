import { PrismaClient } from '@prisma/client'
import * as bcrypt from 'bcrypt'

const prisma = new PrismaClient()

const hashedPassword = async (pwd: string) => await bcrypt.hash(pwd, 10)

async function main() {
  console.log('Clearing database...')
  await prisma.notificationLog.deleteMany()
  await prisma.schedule.deleteMany()
  await prisma.appointment.deleteMany()
  await prisma.availabilityBlock.deleteMany()
  await prisma.patient.deleteMany()
  await prisma.motifPractitioner.deleteMany()
  await prisma.motifResource.deleteMany()
  await prisma.motif.deleteMany()
  await prisma.session.deleteMany()
  await prisma.resourcePractitioner.deleteMany()
  await prisma.resource.deleteMany()
  await prisma.service.deleteMany()
  await prisma.category.deleteMany()
  await prisma.contact.deleteMany()
  await prisma.user.deleteMany()

  await prisma.user.create({
    data: {
      name: 'Admin',
      email: 'admin@widamine.com',
      password: await hashedPassword('admin123'),
      role: 'ADMIN',
      admin: true,
    },
  })

  console.log('Seed complete: admin@widamine.com / admin123')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
