import { PrismaClient } from '@prisma/client'
import * as bcrypt from 'bcrypt'

const prisma = new PrismaClient()

const hashedPassword = async (pwd: string) => await bcrypt.hash(pwd, 10)

async function main() {
  console.log('🌱 Starting database seed...')

  // Clear existing data
  console.log('Clearing existing data...')
  await prisma.notificationLog.deleteMany()
  await prisma.schedule.deleteMany()
  await prisma.appointment.deleteMany()
  await prisma.availabilityBlock.deleteMany()
  await prisma.patient.deleteMany()
  await prisma.motifPractitioner.deleteMany()
  await prisma.motifResource.deleteMany()
  await prisma.motif.deleteMany()
  await prisma.session.deleteMany()
  await prisma.resource.deleteMany()
  await prisma.service.deleteMany()
  await prisma.category.deleteMany()
  await prisma.user.deleteMany()

  // 1. USERS - Admin, Doctors, Receptionists
  console.log('Creating users...')
  const admin = await prisma.user.create({
    data: {
      name: 'Admin',
      email: 'admin@widamine.com',
      password: await hashedPassword('admin123'),
      role: 'ADMIN',
      admin: true,
    },
  })

  const doctor1 = await prisma.user.create({
    data: {
      name: 'Dr. SLAOUI Widad',
      email: 'dr.slaoui@widamine.com',
      password: await hashedPassword('doctor123'),
      role: 'DOCTOR',
      admin: false,
    },
  })

  const doctor2 = await prisma.user.create({
    data: {
      name: 'Dr. BENNANI Karim',
      email: 'dr.bennani@widamine.com',
      password: await hashedPassword('doctor123'),
      role: 'DOCTOR',
      admin: false,
    },
  })

  const doctor3 = await prisma.user.create({
    data: {
      name: 'Dr. EL ALAOUI Fatima',
      email: 'dr.elalaoui@widamine.com',
      password: await hashedPassword('doctor123'),
      role: 'DOCTOR',
      admin: false,
    },
  })

  const receptionist1 = await prisma.user.create({
    data: {
      name: 'SALMA Reception',
      email: 'reception@widamine.com',
      password: await hashedPassword('reception123'),
      role: 'RECEPTIONIST',
      admin: false,
    },
  })

  const receptionist2 = await prisma.user.create({
    data: {
      name: 'NORA Accueil',
      email: 'accueil@widamine.com',
      password: await hashedPassword('reception123'),
      role: 'RECEPTIONIST',
      admin: false,
    },
  })

  console.log(`✅ Created ${5} users`)

  // 2. CATEGORIES
  console.log('Creating categories...')
  const categories = await Promise.all([
    prisma.category.upsert({
      where: { slug: 'esthetique-visage' },
      update: {},
      create: { name: 'Esthétique du Visage', slug: 'esthetique-visage' },
    }),
    prisma.category.upsert({
      where: { slug: 'esthetique-corps' },
      update: {},
      create: { name: 'Esthétique du Corps', slug: 'esthetique-corps' },
    }),
    prisma.category.upsert({
      where: { slug: 'chirurgie-esthetique' },
      update: {},
      create: { name: 'Chirurgie Esthétique', slug: 'chirurgie-esthetique' },
    }),
    prisma.category.upsert({
      where: { slug: 'dermatologie' },
      update: {},
      create: { name: 'Dermatologie', slug: 'dermatologie' },
    }),
    prisma.category.upsert({
      where: { slug: 'laser-medical' },
      update: {},
      create: { name: 'Laser Médical', slug: 'laser-medical' },
    }),
    prisma.category.upsert({
      where: { slug: 'medecine-esthetique' },
      update: {},
      create: { name: 'Médecine Esthétique', slug: 'medecine-esthetique' },
    }),
  ])

  console.log(`✅ Created ${categories.length} categories`)

  // 3. SERVICES
  console.log('Creating services...')
  const services = await Promise.all([
    prisma.service.create({
      data: {
        name: 'Injection Botox',
        slug: 'injection-botox',
        price: 2500,
        categoryId: categories[5].id,
        primaryDoctorId: doctor1.id,
        allowedDoctorIds: [doctor1.id, doctor2.id],
        allowedSalleIds: [],
      },
    }),
    prisma.service.create({
      data: {
        name: 'Acide Hyaluronique',
        slug: 'acide-hyaluronique',
        price: 3200,
        categoryId: categories[5].id,
        primaryDoctorId: doctor1.id,
        allowedDoctorIds: [doctor1.id, doctor3.id],
        allowedSalleIds: [],
      },
    }),
    prisma.service.create({
      data: {
        name: 'Liposuccion Vaser',
        slug: 'liposuccion-vaser',
        price: 25000,
        categoryId: categories[2].id,
        primaryDoctorId: doctor2.id,
        allowedDoctorIds: [doctor1.id, doctor2.id, doctor3.id],
        allowedSalleIds: [],
      },
    }),
    prisma.service.create({
      data: {
        name: 'Augmentation Mammaire',
        slug: 'augmentation-mammaire',
        price: 35000,
        categoryId: categories[2].id,
        primaryDoctorId: doctor1.id,
        allowedDoctorIds: [doctor1.id, doctor2.id],
        allowedSalleIds: [],
      },
    }),
    prisma.service.create({
      data: {
        name: 'Blépharoplastie',
        slug: 'blepharoplastie',
        price: 18000,
        categoryId: categories[2].id,
        primaryDoctorId: doctor3.id,
        allowedDoctorIds: [doctor1.id, doctor3.id],
        allowedSalleIds: [],
      },
    }),
    prisma.service.create({
      data: {
        name: 'Peeling Chimique',
        slug: 'peeling-chimique',
        price: 1500,
        categoryId: categories[0].id,
        primaryDoctorId: doctor1.id,
        allowedDoctorIds: [doctor1.id, doctor2.id, doctor3.id],
        allowedSalleIds: [],
      },
    }),
    prisma.service.create({
      data: {
        name: 'Épilation Laser',
        slug: 'epilation-laser',
        price: 800,
        categoryId: categories[4].id,
        primaryDoctorId: doctor2.id,
        allowedDoctorIds: [doctor2.id, doctor3.id],
        allowedSalleIds: [],
      },
    }),
    prisma.service.create({
      data: {
        name: 'Traitement des Taches',
        slug: 'traitement-taches',
        price: 1200,
        categoryId: categories[3].id,
        primaryDoctorId: doctor1.id,
        allowedDoctorIds: [doctor1.id, doctor2.id, doctor3.id],
        allowedSalleIds: [],
      },
    }),
    prisma.service.create({
      data: {
        name: 'Brazilian Butt Lift',
        slug: 'bbl',
        price: 28000,
        categoryId: categories[2].id,
        primaryDoctorId: doctor2.id,
        allowedDoctorIds: [doctor2.id, doctor3.id],
        allowedSalleIds: [],
      },
    }),
    prisma.service.create({
      data: {
        name: 'Soin du Visage',
        slug: 'soin-visage',
        price: 600,
        categoryId: categories[0].id,
        primaryDoctorId: doctor3.id,
        allowedDoctorIds: [doctor1.id, doctor2.id, doctor3.id],
        allowedSalleIds: [],
      },
    }),
  ])

  console.log(`✅ Created ${services.length} services`)

  // 4. SESSIONS for each service
  console.log('Creating sessions...')
  for (const service of services) {
    const sessionCount = Math.floor(Math.random() * 3) + 1
    for (let i = 1; i <= sessionCount; i++) {
      await prisma.session.create({
        data: {
          number: i,
          duration: [30, 45, 60, 90][Math.floor(Math.random() * 4)],
          serviceId: service.id,
        },
      })
    }
  }
  console.log('✅ Created sessions for all services')

  // 5. MOTIFS
  console.log('Creating motifs...')
  const motifs = await Promise.all([
    prisma.motif.create({
      data: {
        name: 'Consultation Initiale',
        slug: 'consultation-initiale',
        bookingType: 'CONSULTATION',
        description: 'Première consultation pour évaluer vos besoins',
        duration: 30,
        color: '#3b82f6',
        serviceId: services[0].id,
      },
    }),
    prisma.motif.create({
      data: {
        name: 'Séance de Suivi',
        slug: 'seance-suivi',
        bookingType: 'FOLLOWUP',
        description: 'Suivi post-traitement',
        duration: 20,
        color: '#10b981',
        serviceId: services[0].id,
      },
    }),
    prisma.motif.create({
      data: {
        name: 'Traitement Complet',
        slug: 'traitement-complet',
        bookingType: 'TREATMENT',
        description: 'Séance de traitement complète',
        duration: 60,
        color: '#8b5cf6',
        serviceId: services[1].id,
      },
    }),
    prisma.motif.create({
      data: {
        name: 'Urgence Dermatologique',
        slug: 'urgence-dermo',
        bookingType: 'URGENCY',
        description: 'Consultation urgente',
        duration: 30,
        color: '#ef4444',
        serviceId: services[7].id,
      },
    }),
    prisma.motif.create({
      data: {
        name: 'Pré-opératoire',
        slug: 'pre-operatoire',
        bookingType: 'CONSULTATION',
        description: 'Consultation avant chirurgie',
        duration: 45,
        color: '#f59e0b',
        serviceId: services[2].id,
      },
    }),
    prisma.motif.create({
      data: {
        name: 'Contrôle Post-op',
        slug: 'controle-postop',
        bookingType: 'FOLLOWUP',
        description: 'Contrôle après intervention',
        duration: 30,
        color: '#06b6d4',
        serviceId: services[2].id,
      },
    }),
    prisma.motif.create({
      data: {
        name: 'Séance Laser',
        slug: 'seance-laser',
        bookingType: 'TREATMENT',
        description: 'Séance d\'épilation laser',
        duration: 45,
        color: '#ec4899',
        serviceId: services[6].id,
      },
    }),
    prisma.motif.create({
      data: {
        name: 'Peeling Visage',
        slug: 'peeling-visage',
        bookingType: 'TREATMENT',
        description: 'Séance de peeling',
        duration: 30,
        color: '#14b8a6',
        serviceId: services[5].id,
      },
    }),
  ])

  console.log(`✅ Created ${motifs.length} motifs`)

  // 6. RESOURCES (Salles/Rooms)
  console.log('Creating resources...')
  const resources = await Promise.all([
    prisma.resource.create({
      data: {
        name: 'Salle de Consultation 1',
        slug: 'salle-consultation-1',
        type: 'CONSULTATION',
        description: 'Salle équipée pour consultations',
        priority: 1,
        isActive: true,
      },
    }),
    prisma.resource.create({
      data: {
        name: 'Salle de Consultation 2',
        slug: 'salle-consultation-2',
        type: 'CONSULTATION',
        description: 'Salle équipée pour consultations',
        priority: 2,
        isActive: true,
      },
    }),
    prisma.resource.create({
      data: {
        name: 'Salle de Traitement A',
        slug: 'salle-traitement-a',
        type: 'TREATMENT',
        description: 'Salle équipée pour soins esthétiques',
        priority: 1,
        isActive: true,
      },
    }),
    prisma.resource.create({
      data: {
        name: 'Salle de Traitement B',
        slug: 'salle-traitement-b',
        type: 'TREATMENT',
        description: 'Salle équipée pour soins esthétiques',
        priority: 2,
        isActive: true,
      },
    }),
    prisma.resource.create({
      data: {
        name: 'Salle Laser',
        slug: 'salle-laser',
        type: 'LASER',
        description: 'Salle équipée pour traitements laser',
        priority: 1,
        isActive: true,
      },
    }),
    prisma.resource.create({
      data: {
        name: 'Bloc Opératoire',
        slug: 'bloc-operatoire',
        type: 'SURGERY',
        description: 'Salle d\'opération équipée',
        priority: 1,
        isActive: true,
      },
    }),
    prisma.resource.create({
      data: {
        name: 'Salle de Réveil',
        slug: 'salle-reveil',
        type: 'RECOVERY',
        description: 'Salle de récupération post-op',
        priority: 1,
        isActive: true,
      },
    }),
  ])

  console.log(`✅ Created ${resources.length} resources`)

  // 7. PATIENTS - Create many patients
  console.log('Creating patients...')
  const firstNames = ['Fatima', 'Karim', 'Sofia', 'Youssef', 'Nadia', 'Omar', 'Aicha', 'Hassan', 'Laila', 'Mehdi', 'Samira', 'Amine', 'Zineb', 'Khalid', 'Rajae', 'Hamza', 'Ikram', 'Yassin', 'Bouchra', 'Adil', 'Hanane', 'Mohamed', 'Asmae', 'Rachid', 'Kawtar', 'Imane', 'Saad', 'Dounia', 'Nabil', 'Fatiha']
  const lastNames = ['EL ALAOUI', 'BENNANI', 'CHRAIBI', 'EL FASSI', 'BENJELLOUN', 'TAZI', 'SEBTI', 'KADI', 'ALAMI', 'FILALI', 'LAHMAR', 'MAHMOUDI', 'ZEROUALI', 'DRIOUCH', 'SAADI', 'MANSOURI', 'HASSANI', 'IDRISI', 'NACIRI', 'OULAD', 'RAISSOUNI', 'SBAI', 'TALBI', 'WAHBI', 'YOUSSEFI', 'ZAHIRI', 'AMRANI', 'BOUZIDI', 'DAHBI', 'EL HACHIMI']

  const patients: any[] = []
  for (let i = 0; i < 50; i++) {
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)]
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)]
    const phone = `06${Math.floor(Math.random() * 100000000).toString().padStart(8, '0')}`

    const patient = await prisma.patient.create({
      data: {
        firstName,
        lastName,
        email: `${firstName.toLowerCase()}.${lastName.toLowerCase().replace(' ', '')}${i}@email.com`,
        phone,
        dateOfBirth: new Date(1960 + Math.floor(Math.random() * 45), Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1),
        gender: Math.random() > 0.5 ? 'FEMALE' : 'MALE',
        address: `${Math.floor(Math.random() * 200) + 1} Rue ${['Hassan II', 'Mohamed VI', 'Allal Ben Abdellah', 'Ibn Sina', 'Al Massira'][Math.floor(Math.random() * 5)]}`,
        city: ['Casablanca', 'Rabat', 'Marrakech', 'Fès', 'Tanger'][Math.floor(Math.random() * 5)],
        postalCode: `${Math.floor(Math.random() * 90000) + 10000}`,
        country: 'Maroc',
        medicalHistory: Math.random() > 0.7 ? 'Allergie aux pénicillines' : null,
      },
    })
    patients.push(patient)
  }

  console.log(`✅ Created ${patients.length} patients`)

  // 8. APPOINTMENTS - Create appointments for today only for debugging
  console.log('Creating appointments (rendez-vous)...')
  const statuses = ['PENDING', 'CONFIRMED'] as const // Only active statuses

  const appointments: any[] = []
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())

  // Create 8 appointments for today - ALL in morning slot (09:00-13:00)
  for (let i = 0; i < 8; i++) {
    const patient = patients[Math.floor(Math.random() * patients.length)]
    const service = services[Math.floor(Math.random() * services.length)]
    const motif = motifs[Math.floor(Math.random() * motifs.length)]
    const doctor = [doctor1, doctor2, doctor3][Math.floor(Math.random() * 3)]
    const resource = resources[Math.floor(Math.random() * resources.length)]

    const appointmentDate = new Date(today)

    // Morning time only: 9h to 13h (spread 8 appointments)
    const morningSlots = [
      { h: 9, m: 0 }, { h: 9, m: 30 },
      { h: 10, m: 0 }, { h: 10, m: 30 },
      { h: 11, m: 0 }, { h: 11, m: 30 },
      { h: 12, m: 0 }, { h: 12, m: 30 }
    ]
    const slot = morningSlots[i % morningSlots.length]
    appointmentDate.setHours(slot.h, slot.m, 0, 0)

    const status = statuses[Math.floor(Math.random() * statuses.length)]

    // Set dates based on status
    let confirmedAt: Date | null = null
    let expiresAt: Date | null = null

    if (status === 'CONFIRMED') {
      confirmedAt = new Date(appointmentDate.getTime() - 86400000)
      expiresAt = new Date(appointmentDate.getTime() + 1800000)
    } else {
      expiresAt = new Date(appointmentDate.getTime() + 86400000)
    }

    const appointment = await prisma.appointment.create({
      data: {
        patientId: patient.id,
        name: `${patient.firstName} ${patient.lastName}`,
        email: patient.email || `${patient.phone}@placeholder.com`,
        phone: patient.phone,
        context: 'Test appointment for debugging',
        status,
        timezone: 'Africa/Casablanca',
        expiresAt,
        confirmedAt,
        serviceId: service.id,
        motifId: motif.id,
        practitionerId: doctor.id,
        resourceId: resource.id,
      },
    })

    // Create schedule for the appointment
    await prisma.schedule.create({
      data: {
        datetime: appointmentDate,
        sessionId: (await prisma.session.findFirst({ where: { serviceId: service.id } }))?.id || '',
        appointmentId: appointment.id,
      },
    })

    appointments.push(appointment)
  }

  console.log(`✅ Created ${appointments.length} appointments (rendez-vous) with schedules`)

  // 9. CONTACTS - Contact form submissions
  console.log('Creating contacts...')
  const contactMessages = [
    { name: 'Sophie Martin', email: 'sophie.martin@email.com', phone: '0612345678', context: 'Bonjour, je souhaiterais avoir des informations sur le tarif des injections d\'acide hyaluronique. Merci!' },
    { name: 'Jean Dupont', email: 'jean.dupont@email.com', phone: '0623456789', context: 'Demande de rendez-vous pour une consultation de liposuccion. Disponible la semaine prochaine.' },
    { name: 'Amina Bennani', email: 'amina.b@email.com', phone: '0634567890', context: 'Est-ce que vous proposez des soins pour les cicatrices d\'acné? Merci de me rappeler.' },
    { name: 'Philippe Morin', email: 'p.morin@email.com', phone: '0645678901', context: 'Quels sont vos horaires d\'ouverture le samedi?' },
    { name: 'Linda Tazi', email: 'linda.tazi@email.com', phone: '0656789012', context: 'Je souhaite annuler mon rendez-vous de demain. Comment puis-je faire?' },
    { name: 'Robert Klein', email: 'r.klein@email.com', phone: '0667890123', context: 'Excellente expérience lors de ma dernière visite. Merci à toute l\'équipe!' },
    { name: 'Yasmina Alaoui', email: 'yasmina.a@email.com', phone: '0678901234', context: 'Demande d\'information sur le BBL. Quels sont les risques et le temps de récupération?' },
    { name: 'Samir Fassi', email: 'samir.fassi@email.com', phone: '0689012345', context: 'Puis-je payer en plusieurs fois pour une chirurgie esthétique?' },
    { name: 'Nora Idrissi', email: 'nora.idrissi@email.com', phone: '0690123456', context: 'J\'ai des boutons qui reviennent toujours au même endroit. Puis-je consulter?' },
    { name: 'Marc Levy', email: 'marc.levy@email.com', phone: '0601234567', context: 'Rappel non reçu pour mon RDV d\'aujourd\'hui. Heureusement je suis venu quand même!' },
    { name: 'Fatima Zahra', email: 'fzahra@email.com', phone: '0611122233', context: 'Problème de peau après le peeling. Besoin d\'un suivi urgent.' },
    { name: 'Karim El Amrani', email: 'karim.amrani@email.com', phone: '0622233344', context: 'Demande de devis pour lifting cervico-facial. Merci.' },
    { name: 'Claire Dubois', email: 'claire.dubois@email.com', phone: '0633344455', context: 'Vos locaux sont magnifiques! Je reviendrai avec plaisir.' },
    { name: 'Omar Benjelloun', email: 'omar.b@email.com', phone: '0644455566', context: 'Soucis avec le résultat de mon augmentation mammaire. Je voudrais revoir le Dr.' },
    { name: 'Isabelle Roux', email: 'isabelle.r@email.com', phone: '0655566677', context: 'Question sur les effets secondaires du Botox. Merci de me rassurer.' },
  ]

  for (const msg of contactMessages) {
    await prisma.contact.create({
      data: {
        name: msg.name,
        email: msg.email,
        phone: msg.phone,
        context: msg.context,
        read: Math.random() > 0.5,
        createdAt: new Date(Date.now() - Math.floor(Math.random() * 7 * 24 * 60 * 60 * 1000)),
      },
    })
  }

  console.log(`✅ Created ${contactMessages.length} contacts`)

  // 10. AVAILABILITY BLOCKS
  console.log('Creating availability blocks...')
  const blockReasons = ['Congés', 'Formation médicale', 'Urgence personnelle', 'Maintenance salle', 'Réunion équipe']

  for (let i = 0; i < 10; i++) {
    const doctor = [doctor1, doctor2, doctor3][Math.floor(Math.random() * 3)]
    const startDate = new Date(today)
    startDate.setDate(startDate.getDate() + Math.floor(Math.random() * 30))
    startDate.setHours(9 + Math.floor(Math.random() * 8), 0, 0, 0)

    const endDate = new Date(startDate)
    endDate.setHours(endDate.getHours() + [2, 4, 8][Math.floor(Math.random() * 3)])

    await prisma.availabilityBlock.create({
      data: {
        startsAt: startDate,
        endsAt: endDate,
        reason: blockReasons[Math.floor(Math.random() * blockReasons.length)],
        isActive: true,
        practitionerId: doctor.id,
      },
    })
  }

  console.log('✅ Created 10 availability blocks')

  console.log('\n🎉 SEED COMPLETE!')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('📊 Summary:')
  console.log('   • 5 Users (1 Admin, 3 Doctors, 2 Receptionists)')
  console.log('   • 6 Categories')
  console.log('   • 10 Services')
  console.log('   • 8 Motifs')
  console.log('   • 7 Resources (Salles)')
  console.log('   • 50 Patients')
  console.log('   • 80 Appointments (Rendez-vous)')
  console.log('   • 15 Contacts')
  console.log('   • 10 Availability Blocks')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })