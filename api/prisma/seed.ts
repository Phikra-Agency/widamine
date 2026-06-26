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
  await prisma.resourcePractitioner.deleteMany()
  await prisma.resource.deleteMany()
  await prisma.session.deleteMany()
  await prisma.motif.deleteMany()
  await prisma.contact.deleteMany()
  await prisma.user.deleteMany()
  await prisma.appSettings.deleteMany()

  // ── Users ──────────────────────────────────────────────
  const adminPw = await hash('admin123')
  const docPw = await hash('doctor123')
  const receptionPw = await hash('reception123')

  const admin = await prisma.user.create({
    data: { name: 'Admin Widamine', email: 'admin@widamine.com', password: adminPw, role: 'ADMIN', admin: true, gender: 'MALE' },
  })

  const drAhmed = await prisma.user.create({
    data: { name: 'Dr. Ahmed Benali', email: 'ahmed@widamine.com', password: docPw, role: 'DOCTOR', admin: false, gender: 'MALE' },
  })

  const drFatima = await prisma.user.create({
    data: { name: 'Dr. Fatima Zahra', email: 'fatima@widamine.com', password: docPw, role: 'DOCTOR', admin: false, gender: 'FEMALE' },
  })

  const drYoussef = await prisma.user.create({
    data: { name: 'Dr. Youssef El Amrani', email: 'youssef@widamine.com', password: docPw, role: 'DOCTOR', admin: false, gender: 'MALE' },
  })

  const drNadia = await prisma.user.create({
    data: { name: 'Dr. Nadia Bennani', email: 'nadia@widamine.com', password: docPw, role: 'DOCTOR', admin: false, gender: 'FEMALE' },
  })

  const receptionist = await prisma.user.create({
    data: { name: 'Samir El Khouli', email: 'samir@widamine.com', password: receptionPw, role: 'RECEPTIONIST', admin: false, gender: 'MALE' },
  })

  // ── Motifs ─────────────────────────────────────────────
  const motifConsultation = await prisma.motif.create({
    data: {
      name: 'Consultation', slug: 'consultation',
      duration: 30, color: '#3b82f6', isActive: true,
      requiresPractitionerChoice: false, pendingTtlHours: 24,
      description: 'Consultation générale',
    },
  })

  const motifDetartrage = await prisma.motif.create({
    data: {
      name: 'Détartrage', slug: 'detartrage',
      duration: 45, color: '#10b981', isActive: true,
      requiresPractitionerChoice: false, pendingTtlHours: 24,
      description: 'Détartrage dentaire',
    },
  })

  const motifUrgence = await prisma.motif.create({
    data: {
      name: 'Urgence', slug: 'urgence',
      duration: 30, color: '#ef4444', isActive: true,
      requiresPractitionerChoice: false, pendingTtlHours: 24,
      description: 'Consultation urgente',
    },
  })

  const motifSuivi = await prisma.motif.create({
    data: {
      name: 'Suivi', slug: 'suivi',
      duration: 20, color: '#f59e0b', isActive: true,
      requiresPractitionerChoice: false, pendingTtlHours: 24,
      description: 'Consultation de suivi',
    },
  })

  const motifBilan = await prisma.motif.create({
    data: {
      name: 'Bilan', slug: 'bilan',
      duration: 60, color: '#8b5cf6', isActive: true,
      requiresPractitionerChoice: false, pendingTtlHours: 24,
      description: 'Bilan complet',
    },
  })

  const motifLaser = await prisma.motif.create({
    data: {
      name: 'Laser', slug: 'laser',
      duration: 45, color: '#ec4899', isActive: true,
      requiresPractitionerChoice: true, pendingTtlHours: 24,
      description: 'Séance de laser',
    },
  })

  const motifPeeling = await prisma.motif.create({
    data: {
      name: 'Peeling', slug: 'peeling',
      duration: 30, color: '#14b8a6', isActive: true,
      requiresPractitionerChoice: false, pendingTtlHours: 24,
      description: 'Séance de peeling visage',
    },
  })

  // ── Sessions ───────────────────────────────────────────
  const sessionC1 = await prisma.session.create({ data: { number: 1, duration: 30, motifId: motifConsultation.id } })
  const sessionC2 = await prisma.session.create({ data: { number: 2, duration: 30, motifId: motifConsultation.id } })
  const sessionC3 = await prisma.session.create({ data: { number: 3, duration: 30, motifId: motifConsultation.id } })
  const sessionC4 = await prisma.session.create({ data: { number: 4, duration: 30, motifId: motifConsultation.id } })

  const sessionD1 = await prisma.session.create({ data: { number: 1, duration: 45, motifId: motifDetartrage.id } })
  const sessionD2 = await prisma.session.create({ data: { number: 2, duration: 45, motifId: motifDetartrage.id } })

  const sessionU1 = await prisma.session.create({ data: { number: 1, duration: 30, motifId: motifUrgence.id } })
  const sessionU2 = await prisma.session.create({ data: { number: 2, duration: 30, motifId: motifUrgence.id } })

  const sessionS1 = await prisma.session.create({ data: { number: 1, duration: 20, motifId: motifSuivi.id } })
  const sessionS2 = await prisma.session.create({ data: { number: 2, duration: 20, motifId: motifSuivi.id } })

  const sessionB1 = await prisma.session.create({ data: { number: 1, duration: 60, motifId: motifBilan.id } })
  const sessionB2 = await prisma.session.create({ data: { number: 2, duration: 60, motifId: motifBilan.id } })

  const sessionL1 = await prisma.session.create({ data: { number: 1, duration: 45, motifId: motifLaser.id } })
  const sessionP1 = await prisma.session.create({ data: { number: 1, duration: 30, motifId: motifPeeling.id } })

  // ── MotifPractitioner ──────────────────────────────────
  await prisma.motifPractitioner.createMany({
    data: [
      { motifId: motifConsultation.id, practitionerId: drAhmed.id, priority: 1, isPreferred: true },
      { motifId: motifConsultation.id, practitionerId: drFatima.id, priority: 2 },
      { motifId: motifConsultation.id, practitionerId: drNadia.id, priority: 3 },
      { motifId: motifDetartrage.id, practitionerId: drYoussef.id, priority: 1, isPreferred: true },
      { motifId: motifUrgence.id, practitionerId: drYoussef.id, priority: 1, isPreferred: true },
      { motifId: motifUrgence.id, practitionerId: drAhmed.id, priority: 2 },
      { motifId: motifSuivi.id, practitionerId: drFatima.id, priority: 1, isPreferred: true },
      { motifId: motifSuivi.id, practitionerId: drNadia.id, priority: 2 },
      { motifId: motifBilan.id, practitionerId: drAhmed.id, priority: 1, isPreferred: true },
      { motifId: motifLaser.id, practitionerId: drNadia.id, priority: 1, isPreferred: true },
      { motifId: motifPeeling.id, practitionerId: drFatima.id, priority: 1, isPreferred: true },
    ],
  })

  // ── Resources ──────────────────────────────────────────
  const salle1 = await prisma.resource.create({
    data: { name: 'Salle 1', slug: 'salle-1', type: 'ROOM', description: 'Salle de consultation principale', isActive: true },
  })

  const salle2 = await prisma.resource.create({
    data: { name: 'Salle 2', slug: 'salle-2', type: 'ROOM', description: 'Salle de soins dentaires', isActive: true },
  })

  const salle3 = await prisma.resource.create({
    data: { name: 'Salle 3', slug: 'salle-3', type: 'ROOM', description: 'Salle esthétique', isActive: true },
  })

  const echo = await prisma.resource.create({
    data: { name: 'Échographe', slug: 'echographe', type: 'EQUIPMENT', description: 'Appareil d\'échographie cardiaque', isActive: true },
  })

  const laser = await prisma.resource.create({
    data: { name: 'Laser', slug: 'laser-device', type: 'EQUIPMENT', description: 'Appareil laser dermatologique', isActive: true },
  })

  // ── ResourcePractitioner ───────────────────────────────
  await prisma.resourcePractitioner.createMany({
    data: [
      { resourceId: salle1.id, practitionerId: drAhmed.id, priority: 1, isPreferred: true },
      { resourceId: salle1.id, practitionerId: drFatima.id, priority: 2 },
      { resourceId: salle1.id, practitionerId: drNadia.id, priority: 3 },
      { resourceId: salle2.id, practitionerId: drYoussef.id, priority: 1, isPreferred: true },
      { resourceId: salle3.id, practitionerId: drNadia.id, priority: 1, isPreferred: true },
      { resourceId: salle3.id, practitionerId: drFatima.id, priority: 2 },
      { resourceId: echo.id, practitionerId: drAhmed.id, priority: 1 },
      { resourceId: laser.id, practitionerId: drNadia.id, priority: 1, isPreferred: true },
    ],
  })

  // ── MotifResource ──────────────────────────────────────
  await prisma.motifResource.createMany({
    data: [
      { motifId: motifConsultation.id, resourceId: salle1.id, priority: 1, isPreferred: true },
      { motifId: motifDetartrage.id, resourceId: salle2.id, priority: 1, isPreferred: true },
      { motifId: motifUrgence.id, resourceId: salle2.id, priority: 1, isPreferred: true },
      { motifId: motifSuivi.id, resourceId: salle1.id, priority: 1, isPreferred: true },
      { motifId: motifBilan.id, resourceId: salle1.id, priority: 1, isPreferred: true },
      { motifId: motifBilan.id, resourceId: echo.id, priority: 1, isRequired: true },
      { motifId: motifLaser.id, resourceId: salle3.id, priority: 1, isPreferred: true },
      { motifId: motifLaser.id, resourceId: laser.id, priority: 1, isRequired: true },
      { motifId: motifPeeling.id, resourceId: salle3.id, priority: 1, isPreferred: true },
    ],
  })

  // ── AvailabilityBlock ──────────────────────────────────
  await prisma.availabilityBlock.createMany({
    data: [
      { practitionerId: drAhmed.id, startsAt: today(9, 0), endsAt: today(12, 0), isActive: true },
      { practitionerId: drAhmed.id, startsAt: today(14, 0), endsAt: today(17, 0), isActive: true },
      { practitionerId: drFatima.id, startsAt: today(9, 0), endsAt: today(13, 0), isActive: true },
      { practitionerId: drFatima.id, startsAt: today(14, 30), endsAt: today(17, 30), isActive: true },
      { practitionerId: drYoussef.id, startsAt: today(10, 0), endsAt: today(16, 0), isActive: true },
      { practitionerId: drNadia.id, startsAt: today(9, 0), endsAt: today(12, 30), isActive: true },
      { practitionerId: drNadia.id, startsAt: today(14, 0), endsAt: today(18, 0), isActive: true },
    ],
  })

  // ── Patients ───────────────────────────────────────────
  const patients = await Promise.all([
    prisma.patient.create({ data: { firstName: 'Karim', lastName: 'Bensouda', email: 'karim@email.com', phone: '+212600000001', dateOfBirth: new Date('1990-05-12'), gender: 'MALE', city: 'Casablanca' } }),
    prisma.patient.create({ data: { firstName: 'Nadia', lastName: 'El Ouafi', email: 'nadia@email.com', phone: '+212600000002', dateOfBirth: new Date('1985-11-03'), gender: 'FEMALE', city: 'Rabat' } }),
    prisma.patient.create({ data: { firstName: 'Hassan', lastName: 'Tazi', email: 'hassan@email.com', phone: '+212600000003', dateOfBirth: new Date('1978-08-22'), gender: 'MALE', city: 'Marrakech', medicalHistory: 'Hypertension artérielle' } }),
    prisma.patient.create({ data: { firstName: 'Leila', lastName: 'Benjelloun', email: 'leila@email.com', phone: '+212600000004', dateOfBirth: new Date('1995-02-14'), gender: 'FEMALE', city: 'Fès' } }),
    prisma.patient.create({ data: { firstName: 'Omar', lastName: 'Idrissi', email: 'omar@email.com', phone: '+212600000005', dateOfBirth: new Date('2000-07-30'), gender: 'MALE', city: 'Tanger' } }),
    prisma.patient.create({ data: { firstName: 'Samira', lastName: 'Aït Ali', email: 'samira@email.com', phone: '+212600000006', dateOfBirth: new Date('1982-12-01'), gender: 'FEMALE', city: 'Agadir' } }),
    prisma.patient.create({ data: { firstName: 'Younes', lastName: 'El Fassi', phone: '+212600000007', dateOfBirth: new Date('1975-04-18'), gender: 'MALE', city: 'Oujda' } }),
    prisma.patient.create({ data: { firstName: 'Amina', lastName: 'Berrada', email: 'amina@email.com', phone: '+212600000008', dateOfBirth: new Date('2005-09-25'), gender: 'FEMALE', city: 'Casablanca' } }),
    prisma.patient.create({ data: { firstName: 'Mehdi', lastName: 'Ouazzani', email: 'mehdi@email.com', phone: '+212600000009', dateOfBirth: new Date('1988-03-17'), gender: 'MALE', city: 'Rabat' } }),
    prisma.patient.create({ data: { firstName: 'Imane', lastName: 'El Khouli', email: 'imane@email.com', phone: '+212600000010', dateOfBirth: new Date('1992-07-08'), gender: 'FEMALE', city: 'Casablanca' } }),
    prisma.patient.create({ data: { firstName: 'Rachid', lastName: 'El Amrani', email: 'rachid@email.com', phone: '+212600000011', dateOfBirth: new Date('1965-11-22'), gender: 'MALE', city: 'Fès', medicalHistory: 'Diabète type 2' } }),
    prisma.patient.create({ data: { firstName: 'Sara', lastName: 'Benabid', email: 'sara@email.com', phone: '+212600000012', dateOfBirth: new Date('1998-01-30'), gender: 'FEMALE', city: 'Marrakech' } }),
    prisma.patient.create({ data: { firstName: 'Driss', lastName: 'Berrada', email: 'driss@email.com', phone: '+212600000013', dateOfBirth: new Date('1972-09-14'), gender: 'MALE', city: 'Tanger' } }),
    prisma.patient.create({ data: { firstName: 'Fatima', lastName: 'Zahra', email: 'fatima.z@email.com', phone: '+212600000014', dateOfBirth: new Date('1980-06-05'), gender: 'FEMALE', city: 'Casablanca', medicalHistory: 'Asthme' } }),
    prisma.patient.create({ data: { firstName: 'Hicham', lastName: 'Bennani', email: 'hicham@email.com', phone: '+212600000015', dateOfBirth: new Date('1993-12-25'), gender: 'MALE', city: 'Rabat' } }),
    prisma.patient.create({ data: { firstName: 'Mona', lastName: 'Lahlou', email: 'mona@email.com', phone: '+212600000016', dateOfBirth: new Date('2001-04-19'), gender: 'OTHER', city: 'Agadir' } }),
    prisma.patient.create({ data: { firstName: 'Khalid', lastName: 'El Fassi', email: 'khalid@email.com', phone: '+212600000017', dateOfBirth: new Date('1969-08-11'), gender: 'MALE', city: 'Oujda', medicalHistory: 'Problèmes cardiaques' } }),
    prisma.patient.create({ data: { firstName: 'Nawal', lastName: 'Bouchaib', email: 'nawal@email.com', phone: '+212600000018', dateOfBirth: new Date('1987-10-03'), gender: 'FEMALE', city: 'Casablanca' } }),
  ])

  const [patKarim, patNadia, patHassan, patLeila, patOmar, patSamira, patYounes, patAmina, patMehdi, patImane, patRachid, patSara, patDriss, patFatimaZ, patHicham, patMona, patKhalid, patNawal] = patients

  // ── Appointments + Schedules ────────────────────────────
  // Helper: create appointment + schedule atomically
  async function book(data: {
    patientId: string; name: string; email: string; phone: string
    status: string; context: string; motifId: string; practitionerId: string; resourceId: string
    datetime: Date; sessionId: string
  }) {
    const appt = await prisma.appointment.create({ data: { patientId: data.patientId, name: data.name, email: data.email, phone: data.phone, status: data.status, context: data.context, motifId: data.motifId, practitionerId: data.practitionerId, resourceId: data.resourceId } })
    await prisma.schedule.create({ data: { datetime: data.datetime, sessionId: data.sessionId, appointmentId: appt.id } })
  }

  // TODAY (Fri 2026-06-26)
  // ─ Dr. Ahmed — morning block ─
  await book({ patientId: patKarim.id, name: 'Karim Bensouda', email: 'karim@email.com', phone: '+212600000001', status: 'CONFIRMED', context: 'Douleur au genou', motifId: motifConsultation.id, practitionerId: drAhmed.id, resourceId: salle1.id, datetime: today(9, 0), sessionId: sessionC1.id })
  await book({ patientId: patHassan.id, name: 'Hassan Tazi', email: 'hassan@email.com', phone: '+212600000003', status: 'PENDING', context: 'Suivi tension artérielle', motifId: motifConsultation.id, practitionerId: drAhmed.id, resourceId: salle1.id, datetime: today(9, 0), sessionId: sessionC2.id })
  await book({ patientId: patLeila.id, name: 'Leila Benjelloun', email: 'leila@email.com', phone: '+212600000004', status: 'CONFIRMED', context: 'Bilan cardiaque annuel', motifId: motifBilan.id, practitionerId: drAhmed.id, resourceId: salle1.id, datetime: today(10, 0), sessionId: sessionB1.id })
  await book({ patientId: patRachid.id, name: 'Rachid El Amrani', email: 'rachid@email.com', phone: '+212600000011', status: 'CONFIRMED', context: 'Examen cardiaque complet', motifId: motifBilan.id, practitionerId: drAhmed.id, resourceId: salle1.id, datetime: today(10, 0), sessionId: sessionB2.id })
  await book({ patientId: patHicham.id, name: 'Hicham Bennani', email: 'hicham@email.com', phone: '+212600000015', status: 'PENDING', context: 'Consultation première visite', motifId: motifConsultation.id, practitionerId: drAhmed.id, resourceId: salle1.id, datetime: today(11, 0), sessionId: sessionC3.id })
  // ─ Dr. Ahmed — afternoon block ─
  await book({ patientId: patKhalid.id, name: 'Khalid El Fassi', email: 'khalid@email.com', phone: '+212600000017', status: 'CONFIRMED', context: 'Suivi cardiaque', motifId: motifConsultation.id, practitionerId: drAhmed.id, resourceId: salle1.id, datetime: today(14, 0), sessionId: sessionC4.id })
  await book({ patientId: patYounes.id, name: 'Younes El Fassi', phone: '+212600000007', status: 'CANCELLED', context: 'Annulé par le patient', motifId: motifConsultation.id, practitionerId: drAhmed.id, resourceId: salle1.id, datetime: today(15, 0), sessionId: sessionC1.id, email: 'younes@email.com' })

  // ─ Dr. Fatima — morning block ─
  await book({ patientId: patOmar.id, name: 'Omar Idrissi', email: 'omar@email.com', phone: '+212600000005', status: 'COMPLETED', context: 'Vaccination rappel', motifId: motifSuivi.id, practitionerId: drFatima.id, resourceId: salle1.id, datetime: today(9, 0), sessionId: sessionS1.id })
  await book({ patientId: patAmina.id, name: 'Amina Berrada', email: 'amina@email.com', phone: '+212600000008', status: 'CONFIRMED', context: 'Consultation générale', motifId: motifConsultation.id, practitionerId: drFatima.id, resourceId: salle1.id, datetime: today(9, 30), sessionId: sessionC1.id })
  await book({ patientId: patImane.id, name: 'Imane El Khouli', email: 'imane@email.com', phone: '+212600000010', status: 'PENDING', context: 'Peeling visage première séance', motifId: motifPeeling.id, practitionerId: drFatima.id, resourceId: salle3.id, datetime: today(10, 30), sessionId: sessionP1.id })
  await book({ patientId: patNawal.id, name: 'Nawal Bouchaib', email: 'nawal@email.com', phone: '+212600000018', status: 'CONFIRMED', context: 'Suivi post-opératoire', motifId: motifSuivi.id, practitionerId: drFatima.id, resourceId: salle1.id, datetime: today(11, 0), sessionId: sessionS2.id })

  // ─ Dr. Youssef — morning block ─
  await book({ patientId: patNadia.id, name: 'Nadia El Ouafi', email: 'nadia@email.com', phone: '+212600000002', status: 'CONFIRMED', context: 'Détartrage semestriel', motifId: motifDetartrage.id, practitionerId: drYoussef.id, resourceId: salle2.id, datetime: today(10, 0), sessionId: sessionD1.id })
  await book({ patientId: patSamira.id, name: 'Samira Aït Ali', email: 'samira@email.com', phone: '+212600000006', status: 'PENDING', context: 'Douleur dentaire', motifId: motifUrgence.id, practitionerId: drYoussef.id, resourceId: salle2.id, datetime: today(10, 0), sessionId: sessionU1.id })
  await book({ patientId: patMehdi.id, name: 'Mehdi Ouazzani', email: 'mehdi@email.com', phone: '+212600000009', status: 'CONFIRMED', context: 'Détartrage complet', motifId: motifDetartrage.id, practitionerId: drYoussef.id, resourceId: salle2.id, datetime: today(11, 0), sessionId: sessionD2.id })
  await book({ patientId: patSara.id, name: 'Sara Benabid', email: 'sara@email.com', phone: '+212600000012', status: 'CONFIRMED', context: 'Urgence dentaire', motifId: motifUrgence.id, practitionerId: drYoussef.id, resourceId: salle2.id, datetime: today(14, 0), sessionId: sessionU2.id })

  // ─ Dr. Nadia — all day ─
  await book({ patientId: patFatimaZ.id, name: 'Fatima Zahra', email: 'fatima.z@email.com', phone: '+212600000014', status: 'CONFIRMED', context: 'Séance laser jambes', motifId: motifLaser.id, practitionerId: drNadia.id, resourceId: salle3.id, datetime: today(9, 30), sessionId: sessionL1.id })
  await book({ patientId: patMona.id, name: 'Mona Lahlou', email: 'mona@email.com', phone: '+212600000016', status: 'PENDING', context: 'Consultation esthétique', motifId: motifConsultation.id, practitionerId: drNadia.id, resourceId: salle1.id, datetime: today(11, 0), sessionId: sessionC1.id })
  await book({ patientId: patDriss.id, name: 'Driss Berrada', email: 'driss@email.com', phone: '+212600000013', status: 'PENDING', context: 'Consultation générale', motifId: motifConsultation.id, practitionerId: drNadia.id, resourceId: salle1.id, datetime: today(15, 0), sessionId: sessionC2.id })
  await book({ patientId: patLeila.id, name: 'Leila Benjelloun', email: 'leila@email.com', phone: '+212600000004', status: 'CONFIRMED', context: 'Deuxième séance laser', motifId: motifLaser.id, practitionerId: drNadia.id, resourceId: salle3.id, datetime: today(16, 0), sessionId: sessionL1.id })

  // TOMORROW (Sat 2026-06-27)
  await book({ patientId: patKarim.id, name: 'Karim Bensouda', email: 'karim@email.com', phone: '+212600000001', status: 'PENDING', context: 'Contrôle semaine prochaine', motifId: motifConsultation.id, practitionerId: drAhmed.id, resourceId: salle1.id, datetime: todayPlusDays(1, 9, 0), sessionId: sessionC1.id })
  await book({ patientId: patNadia.id, name: 'Nadia El Ouafi', email: 'nadia@email.com', phone: '+212600000002', status: 'CONFIRMED', context: 'Nettoyage dentaire', motifId: motifDetartrage.id, practitionerId: drYoussef.id, resourceId: salle2.id, datetime: todayPlusDays(1, 10, 0), sessionId: sessionD1.id })
  await book({ patientId: patAmina.id, name: 'Amina Berrada', email: 'amina@email.com', phone: '+212600000008', status: 'CONFIRMED', context: 'Urgence dentaire weekend', motifId: motifUrgence.id, practitionerId: drYoussef.id, resourceId: salle2.id, datetime: todayPlusDays(1, 11, 30), sessionId: sessionU1.id })
  await book({ patientId: patHassan.id, name: 'Hassan Tazi', email: 'hassan@email.com', phone: '+212600000003', status: 'PENDING', context: 'Bilan de contrôle', motifId: motifBilan.id, practitionerId: drAhmed.id, resourceId: salle1.id, datetime: todayPlusDays(1, 14, 0), sessionId: sessionB1.id })
  await book({ patientId: patOmar.id, name: 'Omar Idrissi', email: 'omar@email.com', phone: '+212600000005', status: 'PENDING', context: 'Séance laser première fois', motifId: motifLaser.id, practitionerId: drNadia.id, resourceId: salle3.id, datetime: todayPlusDays(1, 9, 30), sessionId: sessionL1.id })
  await book({ patientId: patFatimaZ.id, name: 'Fatima Zahra', email: 'fatima.z@email.com', phone: '+212600000014', status: 'CONFIRMED', context: 'Peeling visage', motifId: motifPeeling.id, practitionerId: drFatima.id, resourceId: salle3.id, datetime: todayPlusDays(1, 11, 0), sessionId: sessionP1.id })

  // MONDAY (2026-06-29)
  await book({ patientId: patHicham.id, name: 'Hicham Bennani', email: 'hicham@email.com', phone: '+212600000015', status: 'CONFIRMED', context: 'Résultat bilan', motifId: motifBilan.id, practitionerId: drAhmed.id, resourceId: salle1.id, datetime: todayPlusDays(3, 9, 0), sessionId: sessionB2.id })
  await book({ patientId: patSamira.id, name: 'Samira Aït Ali', email: 'samira@email.com', phone: '+212600000006', status: 'PENDING', context: 'Suivi traitement', motifId: motifSuivi.id, practitionerId: drFatima.id, resourceId: salle1.id, datetime: todayPlusDays(3, 9, 0), sessionId: sessionS1.id })
  await book({ patientId: patKarim.id, name: 'Karim Bensouda', email: 'karim@email.com', phone: '+212600000001', status: 'CONFIRMED', context: 'Consultation genou', motifId: motifConsultation.id, practitionerId: drAhmed.id, resourceId: salle1.id, datetime: todayPlusDays(3, 10, 0), sessionId: sessionC1.id })
  await book({ patientId: patKhalid.id, name: 'Khalid El Fassi', email: 'khalid@email.com', phone: '+212600000017', status: 'PENDING', context: 'Consultation cardiaque', motifId: motifConsultation.id, practitionerId: drAhmed.id, resourceId: salle1.id, datetime: todayPlusDays(3, 10, 0), sessionId: sessionC2.id })
  await book({ patientId: patMona.id, name: 'Mona Lahlou', email: 'mona@email.com', phone: '+212600000016', status: 'PENDING', context: 'Première séance laser', motifId: motifLaser.id, practitionerId: drNadia.id, resourceId: salle3.id, datetime: todayPlusDays(3, 11, 0), sessionId: sessionL1.id })
  await book({ patientId: patDriss.id, name: 'Driss Berrada', email: 'driss@email.com', phone: '+212600000013', status: 'CONFIRMED', context: 'Détartrage annuel', motifId: motifDetartrage.id, practitionerId: drYoussef.id, resourceId: salle2.id, datetime: todayPlusDays(3, 14, 0), sessionId: sessionD1.id })

  // TUESDAY (2026-06-30)
  await book({ patientId: patRachid.id, name: 'Rachid El Amrani', email: 'rachid@email.com', phone: '+212600000011', status: 'CONFIRMED', context: 'Suivi diabète', motifId: motifConsultation.id, practitionerId: drAhmed.id, resourceId: salle1.id, datetime: todayPlusDays(4, 9, 0), sessionId: sessionC3.id })
  await book({ patientId: patMehdi.id, name: 'Mehdi Ouazzani', email: 'mehdi@email.com', phone: '+212600000009', status: 'CONFIRMED', context: 'Bilan annuel complet', motifId: motifBilan.id, practitionerId: drAhmed.id, resourceId: salle1.id, datetime: todayPlusDays(4, 10, 30), sessionId: sessionB1.id })
  await book({ patientId: patSara.id, name: 'Sara Benabid', email: 'sara@email.com', phone: '+212600000012', status: 'PENDING', context: 'Douleur dentaire persistante', motifId: motifUrgence.id, practitionerId: drYoussef.id, resourceId: salle2.id, datetime: todayPlusDays(4, 14, 0), sessionId: sessionU2.id })
  await book({ patientId: patNawal.id, name: 'Nawal Bouchaib', email: 'nawal@email.com', phone: '+212600000018', status: 'CONFIRMED', context: 'Séance laser aisselles', motifId: motifLaser.id, practitionerId: drNadia.id, resourceId: salle3.id, datetime: todayPlusDays(4, 15, 0), sessionId: sessionL1.id })

  // ── Contacts ───────────────────────────────────────────
  await prisma.contact.createMany({
    data: [
      { name: 'Rachid El Amrani', email: 'rachid@email.com', phone: '+212611111111', context: 'Bonjour, je souhaiterais prendre un rendez-vous pour une consultation générale.', read: false },
      { name: 'Sara Benabid', email: 'sara@email.com', phone: '+212622222222', context: 'Est-ce que vous traitez les urgences dentaires le weekend ?', read: false },
      { name: 'Mehdi Ouazzani', email: 'mehdi@email.com', phone: '+212633333333', context: 'Je voudrais connaître les tarifs pour un bilan cardiaque complet.', read: true },
      { name: 'Imane El Khouli', email: 'imane@email.com', phone: '+212644444444', context: 'Mon fils a besoin d\'un vaccin, quel est le délai pour obtenir un rendez-vous ?', read: false },
      { name: 'Driss Berrada', email: 'driss@email.com', phone: '+212655555555', context: 'Je suis intéressé par une collaboration avec votre clinique. Pouvez-vous me contacter ?', read: false },
      { name: 'Fatima Zahra', email: 'fatima.z@email.com', phone: '+212666666666', context: 'Puis-je changer mon rendez-vous de lundi à mardi ?', read: false },
    ],
  })

  // ── AppSettings ────────────────────────────────────────
  await prisma.appSettings.create({
    data: {
      singletonKey: 'default',
      smsEnabled: true, emailEnabled: true, inAppEnabled: true,
      smsConfirmation: true, smsReminder: true,
      emailConfirmation: true, emailReminder: true, emailCancellation: true,
      inAppConfirmation: true, inAppReminder: true,
    },
  })

  console.log('--- Seed complete ---')
  console.log(`  Users:      ${await prisma.user.count()} (1 admin, 4 doctors, 1 receptionist)`)
  console.log(`  Patients:   ${await prisma.patient.count()}`)
  console.log(`  Motifs:     ${await prisma.motif.count()}`)
  console.log(`  Sessions:   ${await prisma.session.count()}`)
  console.log(`  Resources:  ${await prisma.resource.count()}`)
  console.log(`  Appts:      ${await prisma.appointment.count()}`)
  console.log(`  Schedules:  ${await prisma.schedule.count()}`)
  console.log(`  Contacts:   ${await prisma.contact.count()}`)
  console.log(`  Credentials:`)
  console.log(`    admin@widamine.com / admin123`)
  console.log(`    {ahmed|fatima|youssef|nadia}@widamine.com / doctor123`)
  console.log(`    samir@widamine.com / reception123`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
