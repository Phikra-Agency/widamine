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
  await prisma.resourcePractitioner.deleteMany()
  await prisma.resource.deleteMany()
  await prisma.service.deleteMany()
  await prisma.category.deleteMany()
  await prisma.contact.deleteMany()
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

  // Additional test accounts requested
  const doctor4 = await prisma.user.create({
    data: {
      name: 'Dr. Test',
      email: 'drtest@widamine.com',
      password: await hashedPassword('drtest@widamine.com'),
      role: 'DOCTOR',
      admin: false,
    },
  })

  const prtest = await prisma.user.create({
    data: {
      name: 'Pr. Test',
      email: 'prtest@widamine.com',
      password: await hashedPassword('prtest@widamine.com'),
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

  console.log(`✅ Created ${8} users`)

  // Aggregate doctors/practitioners for later linking
  const doctors = [doctor1, doctor2, doctor3, doctor4, prtest]

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

  // We'll set allowedSalleIds after resources are created, so create them in two passes
  const serviceData = [
    { name: 'Injection Botox', slug: 'injection-botox', price: 2500, categoryId: categories[5].id, primaryDoctorId: doctor1.id, allowedDoctorIds: [doctor1.id, doctor2.id], types: ['CONSULTATION', 'TREATMENT'] },
    { name: 'Acide Hyaluronique', slug: 'acide-hyaluronique', price: 3200, categoryId: categories[5].id, primaryDoctorId: doctor1.id, allowedDoctorIds: [doctor1.id, doctor3.id], types: ['CONSULTATION', 'TREATMENT'] },
    { name: 'Liposuccion Vaser', slug: 'liposuccion-vaser', price: 25000, categoryId: categories[2].id, primaryDoctorId: doctor2.id, allowedDoctorIds: [doctor1.id, doctor2.id, doctor3.id], types: ['TREATMENT', 'SURGERY'] },
    { name: 'Augmentation Mammaire', slug: 'augmentation-mammaire', price: 35000, categoryId: categories[2].id, primaryDoctorId: doctor1.id, allowedDoctorIds: [doctor1.id, doctor2.id], types: ['TREATMENT', 'SURGERY'] },
    { name: 'Blépharoplastie', slug: 'blepharoplastie', price: 18000, categoryId: categories[2].id, primaryDoctorId: doctor3.id, allowedDoctorIds: [doctor1.id, doctor3.id], types: ['TREATMENT', 'SURGERY'] },
    { name: 'Peeling Chimique', slug: 'peeling-chimique', price: 1500, categoryId: categories[0].id, primaryDoctorId: doctor1.id, allowedDoctorIds: [doctor1.id, doctor2.id, doctor3.id], types: ['CONSULTATION', 'TREATMENT'] },
    { name: 'Épilation Laser', slug: 'epilation-laser', price: 800, categoryId: categories[4].id, primaryDoctorId: doctor2.id, allowedDoctorIds: [doctor2.id, doctor3.id], types: ['LASER'] },
    { name: 'Traitement des Taches', slug: 'traitement-taches', price: 1200, categoryId: categories[3].id, primaryDoctorId: doctor1.id, allowedDoctorIds: [doctor1.id, doctor2.id, doctor3.id], types: ['CONSULTATION', 'TREATMENT'] },
    { name: 'Brazilian Butt Lift', slug: 'bbl', price: 28000, categoryId: categories[2].id, primaryDoctorId: doctor2.id, allowedDoctorIds: [doctor2.id, doctor3.id], types: ['TREATMENT', 'SURGERY'] },
    { name: 'Soin du Visage', slug: 'soin-visage', price: 600, categoryId: categories[0].id, primaryDoctorId: doctor3.id, allowedDoctorIds: [doctor1.id, doctor2.id, doctor3.id], types: ['CONSULTATION', 'TREATMENT'] },
  ]

  // We'll assign allowedSalleIds after resources are created
  // For now, store the raw data and create services with placeholder allowedSalleIds
  const services = await Promise.all(
    serviceData.map((sd) =>
      prisma.service.create({
        data: {
          name: sd.name,
          slug: sd.slug,
          price: sd.price,
          categoryId: sd.categoryId,
          primaryDoctorId: sd.primaryDoctorId,
          allowedDoctorIds: sd.allowedDoctorIds,
          allowedSalleIds: [], // will be updated after resources are created
        },
      })
    )
  )

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
    // Augmentation Mammaire (services[3])
    prisma.motif.create({
      data: {
        name: 'Consultation Augmentation',
        slug: 'consultation-augmentation',
        bookingType: 'CONSULTATION',
        description: 'Consultation pré-opératoire pour augmentation mammaire',
        duration: 45,
        color: '#f59e0b',
        serviceId: services[3].id,
      },
    }),
    prisma.motif.create({
      data: {
        name: 'Suivi Post-Augmentation',
        slug: 'suivi-post-augmentation',
        bookingType: 'FOLLOWUP',
        description: 'Contrôle post-opératoire après augmentation',
        duration: 30,
        color: '#06b6d4',
        serviceId: services[3].id,
      },
    }),
    // Blépharoplastie (services[4])
    prisma.motif.create({
      data: {
        name: 'Consultation Blépharoplastie',
        slug: 'consultation-blepharoplastie',
        bookingType: 'CONSULTATION',
        description: 'Consultation pour blépharoplastie',
        duration: 45,
        color: '#f59e0b',
        serviceId: services[4].id,
      },
    }),
    prisma.motif.create({
      data: {
        name: 'Suivi Post-Blépharoplastie',
        slug: 'suivi-post-blepharoplastie',
        bookingType: 'FOLLOWUP',
        description: 'Contrôle post-opératoire après blépharoplastie',
        duration: 30,
        color: '#06b6d4',
        serviceId: services[4].id,
      },
    }),
    // BBL (services[8])
    prisma.motif.create({
      data: {
        name: 'Consultation BBL',
        slug: 'consultation-bbl',
        bookingType: 'CONSULTATION',
        description: 'Consultation pré-opératoire pour lipofilling fessier',
        duration: 45,
        color: '#f59e0b',
        serviceId: services[8].id,
      },
    }),
    prisma.motif.create({
      data: {
        name: 'Suivi Post-BBL',
        slug: 'suivi-post-bbl',
        bookingType: 'FOLLOWUP',
        description: 'Contrôle post-opératoire après BBL',
        duration: 30,
        color: '#06b6d4',
        serviceId: services[8].id,
      },
    }),
    // Soin du Visage (services[9])
    prisma.motif.create({
      data: {
        name: 'Consultation Soin Visage',
        slug: 'consultation-soin-visage',
        bookingType: 'CONSULTATION',
        description: 'Consultation pour soin du visage',
        duration: 30,
        color: '#3b82f6',
        serviceId: services[9].id,
      },
    }),
    prisma.motif.create({
      data: {
        name: 'Séance Soin Visage',
        slug: 'seance-soin-visage',
        bookingType: 'TREATMENT',
        description: 'Séance de soin du visage',
        duration: 60,
        color: '#8b5cf6',
        serviceId: services[9].id,
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

  // 6a. Update services with allowedSalleIds based on resource types
  console.log('Assigning allowedSalleIds to services...')
  // Mapping: CONSULTATION resources[0,1], TREATMENT resources[2,3], LASER resource[4], SURGERY resource[5], RECOVERY resource[6]
  const consultationSalles = [resources[0].id, resources[1].id]
  const treatmentSalles = [resources[2].id, resources[3].id]
  const laserSalles = [resources[4].id]
  const surgerySalles = [resources[5].id]
  const recoverySalles = [resources[6].id]

  // services[0]=Injection Botox: CONSULTATION + TREATMENT
  await prisma.service.update({ where: { id: services[0].id }, data: { allowedSalleIds: [...consultationSalles, ...treatmentSalles] } })
  // services[1]=Acide Hyaluronique: CONSULTATION + TREATMENT
  await prisma.service.update({ where: { id: services[1].id }, data: { allowedSalleIds: [...consultationSalles, ...treatmentSalles] } })
  // services[2]=Liposuccion Vaser: TREATMENT + SURGERY + RECOVERY
  await prisma.service.update({ where: { id: services[2].id }, data: { allowedSalleIds: [...treatmentSalles, ...surgerySalles, ...recoverySalles] } })
  // services[3]=Augmentation Mammaire: TREATMENT + SURGERY + RECOVERY
  await prisma.service.update({ where: { id: services[3].id }, data: { allowedSalleIds: [...treatmentSalles, ...surgerySalles, ...recoverySalles] } })
  // services[4]=Blépharoplastie: TREATMENT + SURGERY + RECOVERY
  await prisma.service.update({ where: { id: services[4].id }, data: { allowedSalleIds: [...treatmentSalles, ...surgerySalles, ...recoverySalles] } })
  // services[5]=Peeling Chimique: CONSULTATION + TREATMENT
  await prisma.service.update({ where: { id: services[5].id }, data: { allowedSalleIds: [...consultationSalles, ...treatmentSalles] } })
  // services[6]=Épilation Laser: LASER
  await prisma.service.update({ where: { id: services[6].id }, data: { allowedSalleIds: laserSalles } })
  // services[7]=Traitement des Taches: CONSULTATION + TREATMENT
  await prisma.service.update({ where: { id: services[7].id }, data: { allowedSalleIds: [...consultationSalles, ...treatmentSalles] } })
  // services[8]=BBL: TREATMENT + SURGERY + RECOVERY
  await prisma.service.update({ where: { id: services[8].id }, data: { allowedSalleIds: [...treatmentSalles, ...surgerySalles, ...recoverySalles] } })
  // services[9]=Soin du Visage: CONSULTATION + TREATMENT
  await prisma.service.update({ where: { id: services[9].id }, data: { allowedSalleIds: [...consultationSalles, ...treatmentSalles] } })
  console.log('✅ Assigned allowedSalleIds to all services')

  // 6b. RESOURCE-PRACTITIONER links
  console.log('Linking resources to practitioners...')
  for (const resource of resources) {
    // All doctors can use consultation and treatment rooms
    if (resource.type === 'CONSULTATION' || resource.type === 'TREATMENT') {
      for (const doctor of doctors) {
        await prisma.resourcePractitioner.create({
          data: {
            resourceId: resource.id,
            practitionerId: doctor.id,
            priority: resource.priority,
            isActive: true,
          },
        })
      }
    }
    // Only specific doctors for laser and surgery
    if (resource.type === 'LASER') {
      for (const doctor of [doctor2, doctor3, doctor4, prtest]) {
        await prisma.resourcePractitioner.create({
          data: {
            resourceId: resource.id,
            practitionerId: doctor.id,
            priority: 1,
            isActive: true,
          },
        })
      }
    }
    if (resource.type === 'SURGERY' || resource.type === 'RECOVERY') {
      for (const doctor of [doctor1, doctor2, doctor4, prtest]) {
        await prisma.resourcePractitioner.create({
          data: {
            resourceId: resource.id,
            practitionerId: doctor.id,
            priority: 1,
            isActive: true,
          },
        })
      }
    }
  }
  console.log('✅ Linked resources to practitioners')

  // 6c. MOTIF-PRACTITIONER links
  console.log('Linking motifs to practitioners...')
  for (const motif of motifs) {
    // Find which service this motif belongs to, then assign the allowed doctors
    const motifService = services.find(s => s.id === motif.serviceId)
    if (motifService) {
      for (const doctorId of motifService.allowedDoctorIds) {
        await prisma.motifPractitioner.create({
          data: {
            motifId: motif.id,
            practitionerId: doctorId,
            priority: doctorId === motifService.primaryDoctorId ? 1 : 0,
            isPreferred: doctorId === motifService.primaryDoctorId,
            isActive: true,
          },
        })
      }
    }
  }
  console.log('✅ Linked motifs to practitioners')

  // 6d. MOTIF-RESOURCE links
  console.log('Linking motifs to resources...')
  // Re-fetch services to get updated allowedSalleIds
  const freshServices = await prisma.service.findMany()
  for (const motif of motifs) {
    const motifService = freshServices.find(s => s.id === motif.serviceId)
    if (!motifService) continue

    // Get the service's allowed resource IDs
    const allowedIds = new Set(motifService.allowedSalleIds.map(String))

    // Filter resources that this service allows
    const allowedResources = resources.filter(r => allowedIds.has(r.id))

    // Determine which room types are relevant for this motif's bookingType
    let relevantTypes: string[] = []
    switch (motif.bookingType) {
      case 'CONSULTATION':
        relevantTypes = ['CONSULTATION']
        break
      case 'FOLLOWUP':
        relevantTypes = ['CONSULTATION', 'RECOVERY']
        break
      case 'TREATMENT':
        relevantTypes = motif.name.toLowerCase().includes('laser')
          ? ['TREATMENT', 'LASER']
          : ['TREATMENT']
        break
      case 'URGENCY':
        relevantTypes = ['CONSULTATION', 'TREATMENT']
        break
      default:
        relevantTypes = ['CONSULTATION', 'TREATMENT']
    }

    // Link motif to allowed resources whose type is relevant
    const matchedRooms = allowedResources.filter(r => relevantTypes.includes(r.type))

    // If no type match (e.g. CONSULTATION motif on a surgery-only service),
    // fall back to ALL allowed resources for that service
    const roomsToLink = matchedRooms.length > 0 ? matchedRooms : allowedResources

    for (const room of roomsToLink) {
      await prisma.motifResource.create({
        data: {
          motifId: motif.id,
          resourceId: room.id,
          priority: room.priority,
          isRequired: false,
        },
      })
    }
  }
  console.log('✅ Linked motifs to resources')

  // 7. PATIENTS - Create many patients
  console.log('Creating patients...')
  const firstNames = ['Fatima', 'Karim', 'Sofia', 'Youssef', 'Nadia', 'Omar', 'Aicha', 'Hassan', 'Laila', 'Mehdi', 'Samira', 'Amine', 'Zineb', 'Khalid', 'Rajae', 'Hamza', 'Ikram', 'Yassin', 'Bouchra', 'Adil', 'Hanane', 'Mohamed', 'Asmae', 'Rachid', 'Kawtar', 'Imane', 'Saad', 'Dounia', 'Nabil', 'Fatiha']
  const lastNames = ['EL ALAOUI', 'BENNANI', 'CHRAIBI', 'EL FASSI', 'BENJELLOUN', 'TAZI', 'SEBTI', 'KADI', 'ALAMI', 'FILALI', 'LAHMAR', 'MAHMOUDI', 'ZEROUALI', 'DRIOUCH', 'SAADI', 'MANSOURI', 'HASSANI', 'IDRISI', 'NACIRI', 'OULAD', 'RAISSOUNI', 'SBAI', 'TALBI', 'WAHBI', 'YOUSSEFI', 'ZAHIRI', 'AMRANI', 'BOUZIDI', 'DAHBI', 'EL HACHIMI']

  const patients: any[] = []
  for (let i = 0; i < 120; i++) {
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

  // 8. APPOINTMENTS - Create a massive number of appointments across 2 weeks
  console.log('Creating appointments (rendez-vous)...')
  const allStatuses = ['PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED', 'NO_SHOW'] as const

  const appointments: any[] = []
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())

  // Get the Monday of the current week
  const monday = new Date(today)
  monday.setDate(monday.getDate() - ((monday.getDay() + 6) % 7))

  // Doctor-specific service/motif preferences
  const doctorPrefs = [
    { serviceIdxs: [0, 1, 5, 7, 3], motifIdxs: [0, 1, 2, 7, 3, 4, 5] },  // Dr1: botox, hyaluro, peeling, taches, mammaire
    { serviceIdxs: [2, 6, 8, 9], motifIdxs: [4, 5, 6, 7] },                  // Dr2: lipo, laser, BBL, soin visage
    { serviceIdxs: [4, 9, 5, 7], motifIdxs: [4, 5, 7, 3] },                  // Dr3: blepharo, soin, peeling, taches
    { serviceIdxs: [0, 2, 5], motifIdxs: [0,4,5] },                         // Dr4: test doctor - mix
    { serviceIdxs: [2, 6, 9], motifIdxs: [4,6,7] },                         // Prtest: practitioner test - mix
  ]

  // Time slots: morning 8:30-12:00, afternoon 14:00-17:30
  const morningSlots = [
    [8, 30], [9, 0], [9, 30], [10, 0], [10, 30], [11, 0], [11, 30], [12, 0],
  ]
  const afternoonSlots = [
    [14, 0], [14, 30], [15, 0], [15, 30], [16, 0], [16, 30], [17, 0], [17, 30],
  ]

  // Generate appointments for 14 days (2 weeks: current + next)
  for (let dayOffset = 0; dayOffset < 14; dayOffset++) {
    const isSunday = (monday.getDay() + dayOffset) % 7 === 0
    if (isSunday) continue // closed on Sundays

    const isSaturday = (monday.getDay() + dayOffset) % 7 === 6
    const isPast = dayOffset < (today.getTime() - monday.getTime()) / 86400000
    const isToday = dayOffset === Math.floor((today.getTime() - monday.getTime()) / 86400000)

    for (let docIdx = 0; docIdx < doctors.length; docIdx++) {
      const prefs = doctorPrefs[docIdx]
      const slots = isSaturday ? [...morningSlots] : [...morningSlots, ...afternoonSlots]

      // Each doctor gets 5-8 slots per day (some gaps)
      const slotCount = isSaturday ? Math.floor(Math.random() * 3) + 3 : Math.floor(Math.random() * 4) + 5
      const usedSlots = new Set<number>()

      for (let s = 0; s < slotCount; s++) {
        let slotIdx: number
        let attempts = 0
        do {
          slotIdx = Math.floor(Math.random() * slots.length)
          attempts++
        } while (usedSlots.has(slotIdx) && attempts < 20)
        if (usedSlots.has(slotIdx)) continue
        usedSlots.add(slotIdx)

        const [hour, min] = slots[slotIdx]
        const serviceIdx = prefs.serviceIdxs[Math.floor(Math.random() * prefs.serviceIdxs.length)]
        const motifIdx = prefs.motifIdxs[Math.floor(Math.random() * prefs.motifIdxs.length)]
        const patient = patients[Math.floor(Math.random() * patients.length)]
        const service = services[serviceIdx]
        const motif = motifs[motifIdx]
        const doctor = doctors[docIdx]
        const resource = resources[Math.floor(Math.random() * resources.length)]

        const appointmentDate = new Date(monday)
        appointmentDate.setDate(monday.getDate() + dayOffset)
        appointmentDate.setHours(hour, min, 0, 0)

        // Determine status based on timing
        let status: string
        if (isPast) {
          const r = Math.random()
          status = r < 0.55 ? 'COMPLETED' : r < 0.75 ? 'CONFIRMED' : r < 0.9 ? 'CANCELLED' : 'NO_SHOW'
        } else if (isToday) {
          const r = Math.random()
          status = r < 0.3 ? 'COMPLETED' : r < 0.6 ? 'CONFIRMED' : r < 0.8 ? 'PENDING' : 'CANCELLED'
        } else {
          const r = Math.random()
          status = r < 0.5 ? 'CONFIRMED' : r < 0.85 ? 'PENDING' : 'CANCELLED'
        }

        let confirmedAt: Date | null = null
        let expiresAt: Date | null = null

        if (status === 'CONFIRMED' || status === 'COMPLETED') {
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
            context: `${motif.name} - ${service.name}`,
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

        const session = await prisma.session.findFirst({ where: { serviceId: service.id } })
        if (session) {
          await prisma.schedule.create({
            data: {
              datetime: appointmentDate,
              sessionId: session.id,
              appointmentId: appointment.id,
            },
          })
        }

        appointments.push(appointment)
      }
    }
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
    { name: 'Hassan Berrada', email: 'h.berrada@email.com', phone: '0666677788', context: 'Je voudrais prendre RDV pour une épilation laser dos complet. Quel est le tarif?' },
    { name: 'Salma Chraibi', email: 'salma.c@email.com', phone: '0677788899', context: 'Mon traitement Botox a très bien fonctionné! Je veux refaire une séance.' },
    { name: 'Pierre Lemaire', email: 'p.lemaire@email.com', phone: '0688899900', context: 'Je cherche un chirurgien pour rhinoplastie. Avez-vous ce service?' },
    { name: 'Nadia El Fassi', email: 'nadia.ef@email.com', phone: '0699900011', context: 'Suite à ma liposuccion, j\'ai une douleur persistante. Urgence?' },
    { name: 'Ahmed Tazi', email: 'ahmed.tazi@email.com', phone: '0600011122', context: 'Comment se déroule une séance de peeling? Combien de séances faut-il?' },
    { name: 'Marie Laurent', email: 'm.laurent@email.com', phone: '0611223344', context: 'Merci pour l\'accueil chaleureux hier! Le Dr. SLAOUI est formidable.' },
    { name: 'Rachid Alami', email: 'rachid.alami@email.com', phone: '0622334455', context: 'Je souhaite un devis pour blépharoplastie des deux paupières.' },
    { name: 'Leila Filali', email: 'leila.f@email.com', phone: '0633445566', context: 'Peut-on combiner Botox et acide hyaluronique en une seule séance?' },
    { name: 'David Moreau', email: 'd.moreau@email.com', phone: '0644556677', context: 'Mon épilation laser ne donne pas les résultats attendus. Déçu.' },
    { name: 'Zineb Lahmar', email: 'zineb.l@email.com', phone: '0655667788', context: 'Je voudrais offrir un soin du visage à ma mère pour son anniversaire.' },
    { name: 'Thomas Bernard', email: 't.bernard@email.com', phone: '0666778899', context: 'Résultat liposuccion Vaser impeccable après 3 mois. Merci Dr BENNANI!' },
    { name: 'Aicha Mahmoudi', email: 'aicha.m@email.com', phone: '0677889900', context: 'J\'ai peur des injections. Est-ce que c\'est douloureux? Rassurez-moi.' },
    { name: 'Julie Petit', email: 'julie.petit@email.com', phone: '0688990011', context: 'Je voudrais annuler et reporter mon rendez-vous de la semaine prochaine.' },
    { name: 'Mehdi Zerouali', email: 'mehdi.z@email.com', phone: '0699001122', context: 'Avez-vous des promotions en cours pour les soins du visage?' },
    { name: 'Catherine Noir', email: 'c.noir@email.com', phone: '0600112233', context: 'Mon fils de 16 ans a de l\'acné sévère. Pouvons-nous consulter?' },
    { name: 'Youssef Driouch', email: 'youssef.d@email.com', phone: '0611223344', context: 'Je suis intéressé par le traitement des taches brunes sur les mains.' },
    { name: 'Anne Girard', email: 'anne.g@email.com', phone: '0622334455', context: 'Bravo pour votre centre! Propreté et professionnalisme au top.' },
    { name: 'Khalid Saadi', email: 'khalid.s@email.com', phone: '0633445566', context: 'Je voudrais connaître le prix exact du BBL tout compris.' },
    { name: 'Sylvie Roussel', email: 's.roussel@email.com', phone: '0644556677', context: 'Mon peeling a provoqué des rougeurs qui ne partent pas. Inquiete.' },
    { name: 'Hamza Mansour', email: 'hamza.m@email.com', phone: '0655667788', context: 'Je cherche un traitement pour les cernes sous les yeux.' },
    { name: 'Nathalie Simon', email: 'n.simon@email.com', phone: '0666778899', context: 'Quelle est la durée de récupération après une augmentation mammaire?' },
    { name: 'Imane Hassani', email: 'imane.h@email.com', phone: '0677889900', context: 'Je voudrais réserver pour une consultation initiale avec Dr. EL ALAOUI.' },
    { name: 'François Mercier', email: 'f.mercier@email.com', phone: '0688990011', context: 'Est-ce que la clinique est ouverte les jours fériés?' },
    { name: 'Bouchra Naciri', email: 'bouchra.n@email.com', phone: '0699001122', context: 'Très satisfaite de ma séance laser! Résultats visibles dès la 2ème séance.' },
    { name: 'Lucas Garnier', email: 'l.garnier@email.com', phone: '0600112233', context: 'Je voudrais un rendez-vous urgent pour une urgence dermatologique.' },
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
    const doctor = doctors[Math.floor(Math.random() * doctors.length)]
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
  console.log('   • 8 Users (1 Admin, 5 Doctors, 2 Receptionists)')
  console.log('   • 6 Categories')
  console.log('   • 10 Services (with primaryDoctorId + allowedDoctorIds)')
  console.log('   • 8 Motifs (linked to practitioners via MotifPractitioner)')
  console.log('   • 7 Resources (linked to practitioners via ResourcePractitioner)')
  console.log(`   • ${patients.length} Patients`)
  console.log(`   • ${appointments.length} Appointments across 2 weeks (per-doctor, all statuses)`)
  console.log(`   • ${contactMessages.length} Contacts`)
  console.log('   • 10 Availability Blocks')
  console.log('   • Motif↔Resource links, Motif↔Practitioner links, Resource↔Practitioner links')
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