import { PrismaClient } from '@prisma/client'
import * as bcrypt from 'bcrypt'

const prisma = new PrismaClient()

const hash = (pwd: string) => bcrypt.hash(pwd, 10)

function today(hour: number, minute = 0): Date {
  const d = new Date()
  d.setHours(hour, minute, 0, 0)
  return d
}

function todayPlusDays(days: number, hour = 0, minute = 0): Date {
  const d = new Date()
  d.setDate(d.getDate() + days)
  d.setHours(hour, minute, 0, 0)
  return d
}

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
  await prisma.appSettings.deleteMany()

  // ── Users ──────────────────────────────────────────────
  const adminPw = await hash('admin123')
  const docPw = await hash('doctor123')

  const admin = await prisma.user.create({
    data: { name: 'Admin', email: 'admin@widamine.com', password: adminPw, role: 'ADMIN', admin: true },
  })

  const drAhmed = await prisma.user.create({
    data: { name: 'Dr. Ahmed Benali', email: 'ahmed@widamine.com', password: docPw, role: 'DOCTOR', admin: false },
  })

  const drFatima = await prisma.user.create({
    data: { name: 'Dr. Fatima Zahra', email: 'fatima@widamine.com', password: docPw, role: 'DOCTOR', admin: false },
  })

  const drYoussef = await prisma.user.create({
    data: { name: 'Dr. Youssef El Amrani', email: 'youssef@widamine.com', password: docPw, role: 'DOCTOR', admin: false },
  })

  // ── Categories ─────────────────────────────────────────
  const catGeneral = await prisma.category.create({ data: { name: 'Consultation Générale', slug: 'consultation-generale' } })
  const catDental = await prisma.category.create({ data: { name: 'Dentisterie', slug: 'dentisterie' } })
  const catPed = await prisma.category.create({ data: { name: 'Pédiatrie', slug: 'pediatrie' } })
  const catCardio = await prisma.category.create({ data: { name: 'Cardiologie', slug: 'cardiologie' } })
  const catDerma = await prisma.category.create({ data: { name: 'Dermatologie', slug: 'dermatologie' } })

  // ── Services ───────────────────────────────────────────
  const svcGeneral = await prisma.service.create({
    data: {
      name: 'Consultation Générale', slug: 'consultation-generale', price: 250,
      categoryId: catGeneral.id, primaryDoctorId: drAhmed.id,
      allowedDoctorIds: [drAhmed.id, drFatima.id],
      allowedSalleIds: [],
    },
  })

  const svcDental = await prisma.service.create({
    data: {
      name: 'Soins Dentaires', slug: 'soins-dentaires', price: 350,
      categoryId: catDental.id, primaryDoctorId: drYoussef.id,
      allowedDoctorIds: [drYoussef.id],
      allowedSalleIds: [],
    },
  })

  const svcPed = await prisma.service.create({
    data: {
      name: 'Pédiatrie', slug: 'pediatrie', price: 200,
      categoryId: catPed.id, primaryDoctorId: drFatima.id,
      allowedDoctorIds: [drFatima.id],
      allowedSalleIds: [],
    },
  })

  const svcCardio = await prisma.service.create({
    data: {
      name: 'Consultation Cardiaque', slug: 'consultation-cardiaque', price: 400,
      categoryId: catCardio.id, primaryDoctorId: drAhmed.id,
      allowedDoctorIds: [drAhmed.id],
      allowedSalleIds: [],
    },
  })

  // ── Sessions ───────────────────────────────────────────
  const sessionGen1 = await prisma.session.create({ data: { number: 1, duration: 30, serviceId: svcGeneral.id } })
  const sessionGen2 = await prisma.session.create({ data: { number: 2, duration: 30, serviceId: svcGeneral.id } })
  const sessionGen3 = await prisma.session.create({ data: { number: 3, duration: 30, serviceId: svcGeneral.id } })

  const sessionDen1 = await prisma.session.create({ data: { number: 1, duration: 45, serviceId: svcDental.id } })
  const sessionDen2 = await prisma.session.create({ data: { number: 2, duration: 45, serviceId: svcDental.id } })

  const sessionPed1 = await prisma.session.create({ data: { number: 1, duration: 30, serviceId: svcPed.id } })
  const sessionPed2 = await prisma.session.create({ data: { number: 2, duration: 30, serviceId: svcPed.id } })

  const sessionCard1 = await prisma.session.create({ data: { number: 1, duration: 60, serviceId: svcCardio.id } })

  // ── Motifs ─────────────────────────────────────────────
  const motifClassic = await prisma.motif.create({
    data: {
      name: 'Consultation Classique', slug: 'consultation-classique',
      bookingType: 'CLASSIC', duration: 30, serviceId: svcGeneral.id, color: '#3b82f6',
    },
  })

  const motifDetartrage = await prisma.motif.create({
    data: {
      name: 'Détartrage', slug: 'detartrage',
      bookingType: 'CLASSIC', duration: 45, serviceId: svcDental.id, color: '#10b981',
    },
  })

  const motifUrgence = await prisma.motif.create({
    data: {
      name: 'Urgence Dentaire', slug: 'urgence-dentaire',
      bookingType: 'URGENT', duration: 30, serviceId: svcDental.id, color: '#ef4444',
    },
  })

  const motifVaccin = await prisma.motif.create({
    data: {
      name: 'Vaccination', slug: 'vaccination',
      bookingType: 'CLASSIC', duration: 20, serviceId: svcPed.id, color: '#f59e0b',
    },
  })

  const motifBilan = await prisma.motif.create({
    data: {
      name: 'Bilan Cardiaque', slug: 'bilan-cardiaque',
      bookingType: 'CLASSIC', duration: 60, serviceId: svcCardio.id, color: '#8b5cf6',
    },
  })

  // ── MotifPractitioner ──────────────────────────────────
  await prisma.motifPractitioner.createMany({
    data: [
      { motifId: motifClassic.id, practitionerId: drAhmed.id, priority: 1, isPreferred: true },
      { motifId: motifClassic.id, practitionerId: drFatima.id, priority: 2 },
      { motifId: motifDetartrage.id, practitionerId: drYoussef.id, priority: 1, isPreferred: true },
      { motifId: motifUrgence.id, practitionerId: drYoussef.id, priority: 1, isPreferred: true },
      { motifId: motifVaccin.id, practitionerId: drFatima.id, priority: 1, isPreferred: true },
      { motifId: motifBilan.id, practitionerId: drAhmed.id, priority: 1, isPreferred: true },
    ],
  })

  // ── Resources ──────────────────────────────────────────
  const salle1 = await prisma.resource.create({
    data: { name: 'Salle 1', slug: 'salle-1', type: 'ROOM', description: 'Salle de consultation principale' },
  })

  const salle2 = await prisma.resource.create({
    data: { name: 'Salle 2', slug: 'salle-2', type: 'ROOM', description: 'Salle de soins dentaires' },
  })

  const echo = await prisma.resource.create({
    data: { name: 'Échographe', slug: 'echographe', type: 'EQUIPMENT', description: 'Appareil d\'échographie cardiaque' },
  })

  // ── ResourcePractitioner ───────────────────────────────
  await prisma.resourcePractitioner.createMany({
    data: [
      { resourceId: salle1.id, practitionerId: drAhmed.id, priority: 1, isPreferred: true },
      { resourceId: salle1.id, practitionerId: drFatima.id, priority: 2 },
      { resourceId: salle2.id, practitionerId: drYoussef.id, priority: 1, isPreferred: true },
      { resourceId: echo.id, practitionerId: drAhmed.id, priority: 1 },
    ],
  })

  // ── MotifResource ──────────────────────────────────────
  await prisma.motifResource.createMany({
    data: [
      { motifId: motifClassic.id, resourceId: salle1.id, priority: 1, isPreferred: true },
      { motifId: motifDetartrage.id, resourceId: salle2.id, priority: 1, isPreferred: true, isRequired: true },
      { motifId: motifUrgence.id, resourceId: salle2.id, priority: 1, isPreferred: true, isRequired: true },
      { motifId: motifVaccin.id, resourceId: salle1.id, priority: 1, isPreferred: true },
      { motifId: motifBilan.id, resourceId: salle1.id, priority: 1, isPreferred: true },
      { motifId: motifBilan.id, resourceId: echo.id, priority: 1, isRequired: true },
    ],
  })

  // ── AvailabilityBlock (practitioner availability today) ─
  await prisma.availabilityBlock.createMany({
    data: [
      { practitionerId: drAhmed.id, startsAt: today(9, 0), endsAt: today(12, 0), isActive: true },
      { practitionerId: drAhmed.id, startsAt: today(14, 0), endsAt: today(17, 0), isActive: true },
      { practitionerId: drFatima.id, startsAt: today(9, 0), endsAt: today(13, 0), isActive: true },
      { practitionerId: drYoussef.id, startsAt: today(10, 0), endsAt: today(16, 0), isActive: true },
    ],
  })

  // ── Patients ───────────────────────────────────────────
  const patKarim = await prisma.patient.create({
    data: {
      firstName: 'Karim', lastName: 'Bensouda', email: 'karim@email.com', phone: '+212600000001',
      dateOfBirth: new Date('1990-05-12'), gender: 'M', city: 'Casablanca', country: 'Maroc',
    },
  })

  const patNadia = await prisma.patient.create({
    data: {
      firstName: 'Nadia', lastName: 'El Ouafi', email: 'nadia@email.com', phone: '+212600000002',
      dateOfBirth: new Date('1985-11-03'), gender: 'F', city: 'Rabat', country: 'Maroc',
    },
  })

  const patHassan = await prisma.patient.create({
    data: {
      firstName: 'Hassan', lastName: 'Tazi', email: 'hassan@email.com', phone: '+212600000003',
      dateOfBirth: new Date('1978-08-22'), gender: 'M', city: 'Marrakech', country: 'Maroc',
      medicalHistory: 'Hypertension artérielle',
    },
  })

  const patLeila = await prisma.patient.create({
    data: {
      firstName: 'Leila', lastName: 'Benjelloun', email: 'leila@email.com', phone: '+212600000004',
      dateOfBirth: new Date('1995-02-14'), gender: 'F', city: 'Fès', country: 'Maroc',
    },
  })

  const patOmar = await prisma.patient.create({
    data: {
      firstName: 'Omar', lastName: 'Idrissi', email: 'omar@email.com', phone: '+212600000005',
      dateOfBirth: new Date('2000-07-30'), gender: 'M', city: 'Tanger', country: 'Maroc',
    },
  })

  const patSamira = await prisma.patient.create({
    data: {
      firstName: 'Samira', lastName: 'Aït Ali', email: 'samira@email.com', phone: '+212600000006',
      dateOfBirth: new Date('1982-12-01'), gender: 'F', city: 'Agadir', country: 'Maroc',
    },
  })

  const patYounes = await prisma.patient.create({
    data: {
      firstName: 'Younes', lastName: 'El Fassi', phone: '+212600000007',
      dateOfBirth: new Date('1975-04-18'), gender: 'M', city: 'Oujda', country: 'Maroc',
    },
  })

  const patAmina = await prisma.patient.create({
    data: {
      firstName: 'Amina', lastName: 'Berrada', email: 'amina@email.com', phone: '+212600000008',
      dateOfBirth: new Date('2005-09-25'), gender: 'F', city: 'Casablanca', country: 'Maroc',
    },
  })

  // ── Appointments (today) ───────────────────────────────
  const app1 = await prisma.appointment.create({
    data: {
      patientId: patKarim.id, name: 'Karim Bensouda', email: 'karim@email.com', phone: '+212600000001',
      status: 'CONFIRMED', context: 'Douleur au genou',
      serviceId: svcGeneral.id, motifId: motifClassic.id, practitionerId: drAhmed.id, resourceId: salle1.id,
    },
  })

  const app2 = await prisma.appointment.create({
    data: {
      patientId: patNadia.id, name: 'Nadia El Ouafi', email: 'nadia@email.com', phone: '+212600000002',
      status: 'CONFIRMED', context: 'Détartrage semestriel',
      serviceId: svcDental.id, motifId: motifDetartrage.id, practitionerId: drYoussef.id, resourceId: salle2.id,
    },
  })

  const app3 = await prisma.appointment.create({
    data: {
      patientId: patHassan.id, name: 'Hassan Tazi', email: 'hassan@email.com', phone: '+212600000003',
      status: 'PENDING', context: 'Suivi tension artérielle',
      serviceId: svcGeneral.id, motifId: motifClassic.id, practitionerId: drAhmed.id, resourceId: salle1.id,
    },
  })

  const app4 = await prisma.appointment.create({
    data: {
      patientId: patLeila.id, name: 'Leila Benjelloun', email: 'leila@email.com', phone: '+212600000004',
      status: 'CONFIRMED', context: 'Bilan cardiaque annuel',
      serviceId: svcCardio.id, motifId: motifBilan.id, practitionerId: drAhmed.id, resourceId: salle1.id,
    },
  })

  const app5 = await prisma.appointment.create({
    data: {
      patientId: patOmar.id, name: 'Omar Idrissi', email: 'omar@email.com', phone: '+212600000005',
      status: 'COMPLETED', context: 'Vaccination rappel',
      serviceId: svcPed.id, motifId: motifVaccin.id, practitionerId: drFatima.id, resourceId: salle1.id,
    },
  })

  const app6 = await prisma.appointment.create({
    data: {
      patientId: patSamira.id, name: 'Samira Aït Ali', email: 'samira@email.com', phone: '+212600000006',
      status: 'PENDING', context: 'Douleur dentaire',
      serviceId: svcDental.id, motifId: motifUrgence.id, practitionerId: drYoussef.id, resourceId: salle2.id,
    },
  })

  const app7 = await prisma.appointment.create({
    data: {
      patientId: patYounes.id, name: 'Younes El Fassi', phone: '+212600000007',
      status: 'CANCELLED', context: 'Annulé par le patient',
      serviceId: svcGeneral.id, motifId: motifClassic.id, practitionerId: drAhmed.id, resourceId: salle1.id,
      email: 'younes@email.com',
    },
  })

  const app8 = await prisma.appointment.create({
    data: {
      patientId: patAmina.id, name: 'Amina Berrada', email: 'amina@email.com', phone: '+212600000008',
      status: 'CONFIRMED', context: 'Consultation générale',
      serviceId: svcGeneral.id, motifId: motifClassic.id, practitionerId: drFatima.id, resourceId: salle1.id,
    },
  })

  // today + 1 day (tomorrow)
  const app9 = await prisma.appointment.create({
    data: {
      patientId: patKarim.id, name: 'Karim Bensouda', email: 'karim@email.com', phone: '+212600000001',
      status: 'PENDING', context: 'Contrôle',
      serviceId: svcGeneral.id, motifId: motifClassic.id, practitionerId: drAhmed.id, resourceId: salle1.id,
    },
  })

  // ── Schedules (appointment times today) ────────────────
  await prisma.schedule.createMany({
    data: [
      { datetime: today(9, 0), sessionId: sessionGen1.id, appointmentId: app1.id },
      { datetime: today(10, 0), sessionId: sessionDen1.id, appointmentId: app2.id },
      { datetime: today(10, 30), sessionId: sessionGen2.id, appointmentId: app3.id },
      { datetime: today(11, 0), sessionId: sessionCard1.id, appointmentId: app4.id },
      { datetime: today(9, 0), sessionId: sessionPed1.id, appointmentId: app5.id },
      { datetime: today(14, 0), sessionId: sessionDen2.id, appointmentId: app6.id },
      { datetime: today(15, 0), sessionId: sessionGen3.id, appointmentId: app7.id },
      { datetime: today(16, 0), sessionId: sessionGen3.id, appointmentId: app8.id },
      { datetime: todayPlusDays(1, 9, 0), sessionId: sessionGen1.id, appointmentId: app9.id },
    ],
  })

  // ── Contacts (messages) ────────────────────────────────
  await prisma.contact.createMany({
    data: [
      { name: 'Rachid El Amrani', email: 'rachid@email.com', phone: '+212611111111', context: 'Bonjour, je souhaiterais prendre un rendez-vous pour une consultation générale. Merci.', read: false },
      { name: 'Sara Benabid', email: 'sara@email.com', phone: '+212622222222', context: 'Est-ce que vous traitez les urgences dentaires le weekend ?', read: false },
      { name: 'Mehdi Ouazzani', email: 'mehdi@email.com', phone: '+212633333333', context: 'Je voudrais connaître les tarifs pour un bilan cardiaque complet.', read: true },
      { name: 'Imane El Khouli', email: 'imane@email.com', phone: '+212644444444', context: 'Mon fils a besoin d\'un vaccin, quel est le délai pour obtenir un rendez-vous ?', read: false },
      { name: 'Driss Berrada', email: 'driss@email.com', phone: '+212655555555', context: 'Je suis intéressé par une collaboration avec votre clinique. Pouvez-vous me contacter ?', read: false },
    ],
  })

  // ── AppSettings ────────────────────────────────────────
  await prisma.appSettings.create({
    data: {
      singletonKey: 'default',
      smsEnabled: true, emailEnabled: true, inAppEnabled: true,
      smsConfirmation: true, smsReminder: true, smsCancellation: false,
      emailConfirmation: true, emailReminder: true, emailCancellation: true,
      inAppConfirmation: true, inAppReminder: true, inAppCancellation: false,
    },
  })

  console.log('--- Seed complete ---')
  console.log(`  Admin:     admin@widamine.com / admin123`)
  console.log(`  Doctors:   ahmed@widamine.com / doctor123`)
  console.log(`             fatima@widamine.com / doctor123`)
  console.log(`             youssef@widamine.com / doctor123`)
  console.log(`  Patients:  8 created`)
  console.log(`  Appts:     9 created (8 today, 1 tomorrow)`)
  console.log(`  Contacts:  5 created`)
  console.log(`  Services:  4 · Categories: 5 · Motifs: 5 · Resources: 3`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
