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

  const motifFacial = await prisma.motif.create({
    data: { name: 'Facial Aesthetics', slug: 'facial-aesthetics', duration: 45, color: '#14B8A6', isActive: true, requiresPractitionerChoice: true, pendingTtlHours: 24, description: 'Soins esthétiques du visage' },
  })

  const motifLip = await prisma.motif.create({
    data: { name: 'Lip Aesthetics', slug: 'lip-aesthetics', duration: 30, color: '#EC4899', isActive: true, requiresPractitionerChoice: true, pendingTtlHours: 24, description: 'Esthétique des lèvres — acide hyaluronique' },
  })

  const motifEye = await prisma.motif.create({
    data: { name: 'Eye Aesthetics', slug: 'eye-aesthetics', duration: 30, color: '#0EA5E9', isActive: true, requiresPractitionerChoice: true, pendingTtlHours: 24, description: 'Esthétique de l\'œil — cernes, ridules' },
  })

  const motifBrow = await prisma.motif.create({
    data: { name: 'Eyebrow Aesthetics', slug: 'eyebrow-aesthetics', duration: 30, color: '#10B981', isActive: true, requiresPractitionerChoice: true, pendingTtlHours: 24, description: 'Esthétique des sourcils' },
  })

  const motifBody = await prisma.motif.create({
    data: { name: 'Body Aesthetics', slug: 'body-aesthetics', duration: 60, color: '#2E90C0', isActive: true, requiresPractitionerChoice: true, pendingTtlHours: 24, description: 'Chirurgie & esthétique corporelle' },
  })

  const motifBreast = await prisma.motif.create({
    data: { name: 'Breast Aesthetics', slug: 'breast-aesthetics', duration: 90, color: '#F472B6', isActive: true, requiresPractitionerChoice: true, pendingTtlHours: 24, description: 'Esthétique mammaire' },
  })

  const motifBBL = await prisma.motif.create({
    data: { name: 'Brazilian Butt Lift', slug: 'bbl', duration: 120, color: '#F59E0B', isActive: true, requiresPractitionerChoice: true, pendingTtlHours: 24, description: 'Lipofilling des fesses' },
  })

  const motifLipo = await prisma.motif.create({
    data: { name: 'Liposuction', slug: 'liposuction', duration: 120, color: '#EF4444', isActive: true, requiresPractitionerChoice: true, pendingTtlHours: 24, description: 'Liposuccion esthétique' },
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
  await prisma.session.create({ data: { number: 1, duration: 45, motifId: motifFacial.id } })
  await prisma.session.create({ data: { number: 1, duration: 30, motifId: motifLip.id } })
  await prisma.session.create({ data: { number: 1, duration: 30, motifId: motifEye.id } })
  await prisma.session.create({ data: { number: 1, duration: 30, motifId: motifBrow.id } })
  await prisma.session.create({ data: { number: 1, duration: 60, motifId: motifBody.id } })
  await prisma.session.create({ data: { number: 1, duration: 90, motifId: motifBreast.id } })
  await prisma.session.create({ data: { number: 1, duration: 120, motifId: motifBBL.id } })
  await prisma.session.create({ data: { number: 1, duration: 120, motifId: motifLipo.id } })

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
      { motifId: motifFacial.id, practitionerId: drNadia.id, priority: 1, isPreferred: true },
      { motifId: motifLip.id, practitionerId: drNadia.id, priority: 1, isPreferred: true },
      { motifId: motifEye.id, practitionerId: drNadia.id, priority: 1, isPreferred: true },
      { motifId: motifBrow.id, practitionerId: drNadia.id, priority: 1, isPreferred: true },
      { motifId: motifBody.id, practitionerId: drFatima.id, priority: 1, isPreferred: true },
      { motifId: motifBreast.id, practitionerId: drFatima.id, priority: 1, isPreferred: true },
      { motifId: motifBBL.id, practitionerId: drFatima.id, priority: 1, isPreferred: true },
      { motifId: motifLipo.id, practitionerId: drFatima.id, priority: 1, isPreferred: true },
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
      { motifId: motifFacial.id, resourceId: salle3.id, priority: 1, isPreferred: true },
      { motifId: motifLip.id, resourceId: salle3.id, priority: 1, isPreferred: true },
      { motifId: motifEye.id, resourceId: salle3.id, priority: 1, isPreferred: true },
      { motifId: motifBrow.id, resourceId: salle3.id, priority: 1, isPreferred: true },
      { motifId: motifBody.id, resourceId: salle3.id, priority: 1, isPreferred: true },
      { motifId: motifBreast.id, resourceId: salle3.id, priority: 1, isPreferred: true },
      { motifId: motifBBL.id, resourceId: salle3.id, priority: 1, isPreferred: true },
      { motifId: motifLipo.id, resourceId: salle3.id, priority: 1, isPreferred: true },
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
  await book({ patientId: patKarim.id, name: 'Karim Bensouda', email: 'karim@email.com', phone: '+212600000001', status: 'CONFIRMED', context: 'Douleur au genou droit qui persiste depuis deux semaines, surtout en montant les escaliers. La douleur est plus forte le matin au réveil et s\'atténue légèrement après quelques pas. J\'ai déjà essayé du paracétamol mais cela ne soulage pas vraiment. J\'ai consulté un ostéopathe il y a deux semaines qui m\'a fait des manipulations mais ça n\'a pas changé grand-chose. Mon médecin généraliste m\'a recommandé de faire une IRM pour voir s\'il y a une lésion méniscale ou ligamentaire, mais je préfère d\'abord avoir l\'avis d\'un spécialiste avant de faire des examens coûteux. Je fais du sport régulièrement, environ trois fois par semaine, je cours et je fais du vélo, et j\'ai peur que ce soit une blessure qui m\'empêche de continuer. La douleur est localisée sur le côté interne du genou et j\'ai parfois une sensation de blocage quand je plie la jambe trop rapidement. Je n\'ai pas d\'antécédents particuliers au niveau des genoux, jamais eu d\'entorse ni de fracture. J\'ai 42 ans et je suis en bonne santé générale, je ne prends aucun traitement au long cours. J\'ai aussi remarqué un léger gonflement du genou en fin de journée quand je reste debout longtemps. Je travaille comme commercial et je marche beaucoup dans la journée, environ 8 à 10 km par jour, ce qui aggrave probablement les symptômes.', motifId: motifConsultation.id, practitionerId: drAhmed.id, resourceId: salle1.id, datetime: today(9, 0), sessionId: sessionC1.id })
  await book({ patientId: patHassan.id, name: 'Hassan Tazi', email: 'hassan@email.com', phone: '+212600000003', status: 'PENDING', context: 'Suivi tension artérielle — mon traitement actuel semble moins efficace depuis un mois. Je prends du Loxen 50mg matin et soir mais ma tension reste élevée autour de 15/9. Mon généraliste m\'a recommandé de consulter pour un ajustement du traitement.', motifId: motifConsultation.id, practitionerId: drAhmed.id, resourceId: salle1.id, datetime: today(9, 0), sessionId: sessionC2.id })
  await book({ patientId: patLeila.id, name: 'Leila Benjelloun', email: 'leila@email.com', phone: '+212600000004', status: 'CONFIRMED', context: 'Bilan cardiaque annuel de routine avec échographie de contrôle. Mon cardiologue m\'a demandé de refaire ce bilan tous les ans depuis mon angioplastie en 2022. Je n\'ai pas de symptômes particuliers actuellement mais je préfère suivre les recommandations.', motifId: motifBilan.id, practitionerId: drAhmed.id, resourceId: salle1.id, datetime: today(10, 0), sessionId: sessionB1.id })
  await book({ patientId: patRachid.id, name: 'Rachid El Amrani', email: 'rachid@email.com', phone: '+212600000011', status: 'CONFIRMED', context: 'Examen cardiaque complet demandé par mon cardiologue suite à des essoufflements que je ressens depuis deux mois. Je m\'essouffle rapidement en montant les escaliers alors qu\'avant je n\'avais aucun problème. Le cardiologue suspecte une possible insuffisance mitrale à vérifier.', motifId: motifBilan.id, practitionerId: drAhmed.id, resourceId: salle1.id, datetime: today(10, 0), sessionId: sessionB2.id })
  await book({ patientId: patHicham.id, name: 'Hicham Bennani', email: 'hicham@email.com', phone: '+212600000015', status: 'PENDING', context: 'Consultation première visite — je viens d\'emménager à Casablanca et cherche un médecin traitant. Je suis diabétique de type 2 sous metformine et j\'ai besoin d\'un suivi régulier. J\'aimerais rencontrer le Dr. Ahmed dont on m\'a beaucoup parlé.', motifId: motifConsultation.id, practitionerId: drAhmed.id, resourceId: salle1.id, datetime: today(11, 0), sessionId: sessionC3.id })
  // ─ Dr. Ahmed — afternoon block ─
  await book({ patientId: patKhalid.id, name: 'Khalid El Fassi', email: 'khalid@email.com', phone: '+212600000017', status: 'CONFIRMED', context: 'Suivi cardiaque trimestriel avec contrôle du traitement anticoagulant. Je prends du Préviscan et je dois vérifier mon INR régulièrement. Je n\'ai pas eu de saignements anormaux mais j\'ai remarqué des bleus plus facilement depuis les dernières semaines.', motifId: motifConsultation.id, practitionerId: drAhmed.id, resourceId: salle1.id, datetime: today(14, 0), sessionId: sessionC4.id })
  await book({ patientId: patYounes.id, name: 'Younes El Fassi', phone: '+212600000007', status: 'CANCELLED', context: 'Annulé par le patient — imprévu professionnel de dernière minute. Je dois me déplacer en urgence à Marrakech pour un chantier. Je rappellerai dès la semaine prochaine pour reprogrammer.', motifId: motifConsultation.id, practitionerId: drAhmed.id, resourceId: salle1.id, datetime: today(15, 0), sessionId: sessionC1.id, email: 'younes@email.com' })

  // ─ Dr. Fatima — morning block ─
  await book({ patientId: patOmar.id, name: 'Omar Idrissi', email: 'omar@email.com', phone: '+212600000005', status: 'COMPLETED', context: 'Vaccination rappel hépatite B — troisième dose du protocole. J\'ai déjà reçu les deux premières doses sans aucun effet secondaire. Mon médecin du travail m\'a rappelé que la troisième dose était due ce mois-ci.', motifId: motifSuivi.id, practitionerId: drFatima.id, resourceId: salle1.id, datetime: today(9, 0), sessionId: sessionS1.id })
  await book({ patientId: patAmina.id, name: 'Amina Berrada', email: 'amina@email.com', phone: '+212600000008', status: 'CONFIRMED', context: 'Consultation générale pour un check-up complet avant le voyage prévu ce mois-ci. Je pars en Thaïlande dans trois semaines et j\'ai besoin de vérifier mes vaccins et d\'avoir des conseils de prévention. J\'aimerais également une prescription d\'antipaludéens au cas où.', motifId: motifConsultation.id, practitionerId: drFatima.id, resourceId: salle1.id, datetime: today(9, 30), sessionId: sessionC1.id })
  await book({ patientId: patImane.id, name: 'Imane El Khouli', email: 'imane@email.com', phone: '+212600000010', status: 'PENDING', context: 'Peeling visage première séance pour traiter les taches pigmentaires et l\'acné légère. J\'ai des taches brunes qui sont apparues après une exposition au soleil l\'été dernier. Ma dermatologue m\'a recommandé un peeling aux acides de fruits en consultation préalable.', motifId: motifPeeling.id, practitionerId: drFatima.id, resourceId: salle3.id, datetime: today(10, 30), sessionId: sessionP1.id })
  await book({ patientId: patNawal.id, name: 'Nawal Bouchaib', email: 'nawal@email.com', phone: '+212600000018', status: 'CONFIRMED', context: 'Suivi post-opératoire à 15 jours de l\'intervention — contrôle de la cicatrisation. J\'ai été opérée d\'une hernie inguinale et tout se passe bien globalement. La cicatrice semble bien propre mais j\'ai encore quelques douleurs quand je tousse ou je me penche.', motifId: motifSuivi.id, practitionerId: drFatima.id, resourceId: salle1.id, datetime: today(11, 0), sessionId: sessionS2.id })

  // ─ Dr. Youssef — morning block ─
  await book({ patientId: patNadia.id, name: 'Nadia El Ouafi', email: 'nadia@email.com', phone: '+212600000002', status: 'CONFIRMED', context: 'Détartrage semestriel de routine avec contrôle des gencives. Mon dentiste m\'a recommandé de venir tous les six mois pour un suivi parodontal. J\'ai tendance à avoir des saignements quand je me brosse les dents.', motifId: motifDetartrage.id, practitionerId: drYoussef.id, resourceId: salle2.id, datetime: today(10, 0), sessionId: sessionD1.id })
  await book({ patientId: patSamira.id, name: 'Samira Aït Ali', email: 'samira@email.com', phone: '+212600000006', status: 'PENDING', context: 'Douleur dentaire vive à la molaire inférieure droite, sensible au chaud et au froid. La douleur est apparue il y a trois jours et s\'intensifie quand je bois quelque chose de chaud. J\'ai regardé dans le miroir et j\'ai l\'impression qu\'il y a une petite fissure visible sur la dent.', motifId: motifUrgence.id, practitionerId: drYoussef.id, resourceId: salle2.id, datetime: today(10, 0), sessionId: sessionU1.id })
  await book({ patientId: patMehdi.id, name: 'Mehdi Ouazzani', email: 'mehdi@email.com', phone: '+212600000009', status: 'CONFIRMED', context: 'Détartrage complet avec bilan parodontal demandé par mon dentiste. Il m\'a dit que j\'avais du tartre accumulé sous la gencive qui pouvait causer une parodontite. Je voudrais aussi en profiter pour un blanchiment doux si c\'est possible.', motifId: motifDetartrage.id, practitionerId: drYoussef.id, resourceId: salle2.id, datetime: today(11, 0), sessionId: sessionD2.id })
  await book({ patientId: patSara.id, name: 'Sara Benabid', email: 'sara@email.com', phone: '+212600000012', status: 'CONFIRMED', context: 'Urgence dentaire — un plombage est tombé et la dent est très sensible. C\'est une dent dévitalisée qui avait été soignée il y a deux ans. Je n\'ai pas mal mais j\'ai peur que l\'infection s\'installe si ça reste ouvert trop longtemps.', motifId: motifUrgence.id, practitionerId: drYoussef.id, resourceId: salle2.id, datetime: today(14, 0), sessionId: sessionU2.id })

  // ─ Dr. Nadia — all day ─
  await book({ patientId: patFatimaZ.id, name: 'Fatima Zahra', email: 'fatima.z@email.com', phone: '+212600000014', status: 'CONFIRMED', context: 'Séance laser jambes — troisième séance du protocole d\'épilation définitive. Les deux premières séances ont donné de bons résultats, environ 60% de réduction de la pilosité. Je supporte bien le laser diode sans crème anesthésiante particulière.', motifId: motifLaser.id, practitionerId: drNadia.id, resourceId: salle3.id, datetime: today(9, 30), sessionId: sessionL1.id })
  await book({ patientId: patMona.id, name: 'Mona Lahlou', email: 'mona@email.com', phone: '+212600000016', status: 'PENDING', context: 'Consultation esthétique pour discuter des options de traitement des cicatrices d\'acné. J\'ai eu de l\'acné sévère adolescente et il me reste des cicatrices sur les joues très marquées. J\'aimerais savoir si le laser fractionné ou les micro-needling sont adaptés à mon cas.', motifId: motifConsultation.id, practitionerId: drNadia.id, resourceId: salle1.id, datetime: today(11, 0), sessionId: sessionC1.id })
  await book({ patientId: patDriss.id, name: 'Driss Berrada', email: 'driss@email.com', phone: '+212600000013', status: 'PENDING', context: 'Consultation générale pour des douleurs lombaires persistantes depuis plusieurs mois. La douleur est située en bas du dos du côté droit et irradie parfois dans la jambe. Je travaille assis devant un ordinateur et je pense que la position est en cause mais les étirements ne suffisent pas.', motifId: motifConsultation.id, practitionerId: drNadia.id, resourceId: salle1.id, datetime: today(15, 0), sessionId: sessionC2.id })
  await book({ patientId: patLeila.id, name: 'Leila Benjelloun', email: 'leila@email.com', phone: '+212600000004', status: 'CONFIRMED', context: 'Deuxième séance laser pour le visage — la première séance a bien fonctionné. Les poils ont commencé à tomber après deux semaines comme prévu. Je suis très satisfaite du résultat et je continue le protocole comme recommandé.', motifId: motifLaser.id, practitionerId: drNadia.id, resourceId: salle3.id, datetime: today(16, 0), sessionId: sessionL1.id })

  // TOMORROW (Sat 2026-06-27)
  await book({ patientId: patKarim.id, name: 'Karim Bensouda', email: 'karim@email.com', phone: '+212600000001', status: 'PENDING', context: 'Contrôle de suivi pour le genou — les anti-inflammatoires ont bien réduit la douleur. Je peux maintenant monter les escaliers sans trop de difficulté. Je voudrais savoir si je dois continuer le traitement encore quelques semaines ou si je peux arrêter.', motifId: motifConsultation.id, practitionerId: drAhmed.id, resourceId: salle1.id, datetime: todayPlusDays(1, 9, 0), sessionId: sessionC1.id })
  await book({ patientId: patNadia.id, name: 'Nadia El Ouafi', email: 'nadia@email.com', phone: '+212600000002', status: 'CONFIRMED', context: 'Nettoyage dentaire de routine avec détartrage et polissage. Cela fait un peu plus de six mois que mon dernier détartrage. Mes gencives saignent parfois quand je passe le fil dentaire, je voudrais vérifier que tout va bien.', motifId: motifDetartrage.id, practitionerId: drYoussef.id, resourceId: salle2.id, datetime: todayPlusDays(1, 10, 0), sessionId: sessionD1.id })
  await book({ patientId: patAmina.id, name: 'Amina Berrada', email: 'amina@email.com', phone: '+212600000008', status: 'CONFIRMED', context: 'Urgence dentaire — abcès apparent sur la gencive avec gonflement de la joue. J\'ai commencé à sentir une boule sur la gencive hier matin et ce matin ma joue a gonflé. J\'ai un peu de fièvre également, 38°C, je crois qu\'il faut traiter rapidement.', motifId: motifUrgence.id, practitionerId: drYoussef.id, resourceId: salle2.id, datetime: todayPlusDays(1, 11, 30), sessionId: sessionU1.id })
  await book({ patientId: patHassan.id, name: 'Hassan Tazi', email: 'hassan@email.com', phone: '+212600000003', status: 'PENDING', context: 'Bilan de contrôle pour renouvellement du traitement antihypertenseur. Mon ordonnance arrive à expiration dans deux semaines et je dois refaire un bilan avant le renouvellement. Ma tension est bien équilibrée depuis le dernier ajustement de dose il y a trois mois.', motifId: motifBilan.id, practitionerId: drAhmed.id, resourceId: salle1.id, datetime: todayPlusDays(1, 14, 0), sessionId: sessionB1.id })
  await book({ patientId: patOmar.id, name: 'Omar Idrissi', email: 'omar@email.com', phone: '+212600000005', status: 'PENDING', context: 'Séance laser première fois pour le dos — séance découverte. J\'ai beaucoup de poils dans le dos et ça me complexe depuis longtemps. Je voudrais d\'abord tester une petite zone pour voir comment ma peau réagit avant de m\'engager sur un protocole complet.', motifId: motifLaser.id, practitionerId: drNadia.id, resourceId: salle3.id, datetime: todayPlusDays(1, 9, 30), sessionId: sessionL1.id })
  await book({ patientId: patFatimaZ.id, name: 'Fatima Zahra', email: 'fatima.z@email.com', phone: '+212600000014', status: 'CONFIRMED', context: 'Peeling visage pour un teint plus uniforme — deuxième séance du protocole. La première séance a bien éliminé les couches superficielles et ma peau est plus lumineuse. Je n\'ai pas eu d\'effets secondaires notables, juste une légère rougeur pendant deux jours.', motifId: motifPeeling.id, practitionerId: drFatima.id, resourceId: salle3.id, datetime: todayPlusDays(1, 11, 0), sessionId: sessionP1.id })

  // MONDAY (2026-06-29)
  await book({ patientId: patHicham.id, name: 'Hicham Bennani', email: 'hicham@email.com', phone: '+212600000015', status: 'CONFIRMED', context: 'Résultat bilan sanguin complet — consultation pour interprétation des analyses. J\'ai fait les prises de sang il y a une semaine comme vous me l\'aviez demandé. Je suis un peu anxieux car mon cholestérol était élevé la dernière fois et j\'aimerais discuter des résultats avec le médecin.', motifId: motifBilan.id, practitionerId: drAhmed.id, resourceId: salle1.id, datetime: todayPlusDays(3, 9, 0), sessionId: sessionB2.id })
  await book({ patientId: patSamira.id, name: 'Samira Aït Ali', email: 'samira@email.com', phone: '+212600000006', status: 'PENDING', context: 'Suivi traitement — évaluation de l\'efficacité du nouveau médicament prescrit. Cela fait trois semaines que je prends le nouveau traitement pour ma thyroïde et je me sens mieux globalement. J\'ai refait une prise de sang hier pour vérifier les niveaux d\'hormones.', motifId: motifSuivi.id, practitionerId: drFatima.id, resourceId: salle1.id, datetime: todayPlusDays(3, 9, 0), sessionId: sessionS1.id })
  await book({ patientId: patKarim.id, name: 'Karim Bensouda', email: 'karim@email.com', phone: '+212600000001', status: 'CONFIRMED', context: 'Consultation genou — retour des résultats d\'IRM et discussion sur la suite du traitement. L\'IRM que vous m\'avez prescrite a révélé une légère fissure du ménisque interne au niveau du compartiment médial, sans lésion ligamentaire associée. Le radiologue a mentionné que la fissure mesure environ 8 mm et qu\'elle est partielle, pas traversante. Je voudrais discuter des options car j\'espère vraiment éviter la chirurgie si possible. Mon ostéopathe m\'a dit que je pouvais peut-être me contenter de la rééducation et du renforcement musculaire, mais mon généraliste m\'a dit qu\'une fissure du ménisque ne guérissait pas toute seule et qu\'il faudrait probablement opérer. Je suis perdu entre les deux avis et j\'aimerais avoir votre expertise pour m\'aider à prendre la bonne décision. J\'ai 42 ans, je suis commercial et je marche énormément dans mon travail, environ 8 à 10 km par jour. Je fais aussi du vélo et du running trois fois par semaine, et j\'ai peur de devoir arrêter le sport si on m\'opère. J\'ai lu que la récupération après une méniscectomie partielle était d\'environ 4 à 6 semaines, mais que la rééducation après une suture méniscale pouvait prendre 4 à 6 mois. Est-ce que dans mon cas, avec une fissure partielle de 8 mm, on peut envisager une suture ou est-ce que la méniscectomie partielle est la seule option ? Je n\'ai pas de blocage articulaire mais j\'ai parfois des sensations d\'instabilité et une douleur quand je tourne sur ma jambe droite. La douleur est gérée avec du paracétamol et de la glace après l\'effort, mais elle revient systématiquement si je force un peu. Je n\'ai pas d\'antécédents de traumatisme direct, la douleur est apparue progressivement sur plusieurs semaines sans vraie raison. Je porte une genouillère simple depuis deux semaines et ça m\'aide un peu mais pas complètement. Je suis prêt à faire tout ce qu\'il faut : rééducation, changement de ma routine sportive, perte de poids si nécessaire. Dites-moi ce que vous pensez du traitement conservateur avant d\'envisager la chirurgie, et si on doit opérer, quelle technique recommandez-vous pour quelqu\'un qui veut reprendre le sport le plus tôt possible ? Merci docteur pour votre avis éclairé.', motifId: motifConsultation.id, practitionerId: drAhmed.id, resourceId: salle1.id, datetime: todayPlusDays(3, 10, 0), sessionId: sessionC1.id })
  await book({ patientId: patKhalid.id, name: 'Khalid El Fassi', email: 'khalid@email.com', phone: '+212600000017', status: 'PENDING', context: 'Consultation cardiaque suite à des douleurs thoraciques intermittentes cette semaine. Les douleurs surviennent surtout après un effort ou en période de stress et durent quelques minutes. Mon père a eu un infarctus à 60 ans et je suis inquiet car j\'ai 55 ans maintenant.', motifId: motifConsultation.id, practitionerId: drAhmed.id, resourceId: salle1.id, datetime: todayPlusDays(3, 10, 0), sessionId: sessionC2.id })
  await book({ patientId: patMona.id, name: 'Mona Lahlou', email: 'mona@email.com', phone: '+212600000016', status: 'PENDING', context: 'Première séance laser pour le maquillage permanent — séance test. J\'ai un tatouage permanent des sourcils qui a viré au rouge avec le temps et je voudrais l\'effacer. On m\'a dit que le laser picosecond était efficace sur les pigments rouges.', motifId: motifLaser.id, practitionerId: drNadia.id, resourceId: salle3.id, datetime: todayPlusDays(3, 11, 0), sessionId: sessionL1.id })
  await book({ patientId: patDriss.id, name: 'Driss Berrada', email: 'driss@email.com', phone: '+212600000013', status: 'CONFIRMED', context: 'Détartrage annuel avec contrôle des gencives et détection précoce des caries. Je n\'ai pas consulté de dentiste depuis deux ans à cause de mon emploi du temps chargé. J\'ai remarqué une sensibilité sur une dent du fond quand je mâche du côté droit.', motifId: motifDetartrage.id, practitionerId: drYoussef.id, resourceId: salle2.id, datetime: todayPlusDays(3, 14, 0), sessionId: sessionD1.id })

  // TUESDAY (2026-06-30)
  await book({ patientId: patRachid.id, name: 'Rachid El Amrani', email: 'rachid@email.com', phone: '+212600000011', status: 'CONFIRMED', context: 'Suivi diabète — contrôle de la glycémie et ajustement du traitement si nécessaire. Ma glycémie à jeun est remontée à 1,40 g/L ces dernières semaines malgré le régime. Je fais attention à mon alimentation mais je pense que ma metformine a besoin d\'être augmentée.', motifId: motifConsultation.id, practitionerId: drAhmed.id, resourceId: salle1.id, datetime: todayPlusDays(4, 9, 0), sessionId: sessionC3.id })
  await book({ patientId: patMehdi.id, name: 'Mehdi Ouazzani', email: 'mehdi@email.com', phone: '+212600000009', status: 'CONFIRMED', context: 'Bilan annuel complet avec analyses sanguines et test d\'effort. Mon entreprise m\'offre un bilan de santé annuel et j\'ai choisi votre clinique pour le réaliser. Je n\'ai pas de symptômes particuliers mais je préfère être suivi régulièrement à 48 ans.', motifId: motifBilan.id, practitionerId: drAhmed.id, resourceId: salle1.id, datetime: todayPlusDays(4, 10, 30), sessionId: sessionB1.id })
  await book({ patientId: patSara.id, name: 'Sara Benabid', email: 'sara@email.com', phone: '+212600000012', status: 'PENDING', context: 'Douleur dentaire persistante depuis une semaine — traitée aux antalgiques sans amélioration. J\'ai pris de l\'amoxicilline et du paracétamol prescrits par mon généraliste mais la douleur persiste. La dent est sensible à la pression et je pense qu\'une carie profonde nécessite un traitement radicalaire.', motifId: motifUrgence.id, practitionerId: drYoussef.id, resourceId: salle2.id, datetime: todayPlusDays(4, 14, 0), sessionId: sessionU2.id })
  await book({ patientId: patNawal.id, name: 'Nawal Bouchaib', email: 'nawal@email.com', phone: '+212600000018', status: 'CONFIRMED', context: 'Séance laser aisselles — quatrième séance sur six du protocole complet. La pilosité a considérablement diminué, environ 80% de réduction depuis le début du protocole. Je recommande vivement cette méthode à mes amies, le résultat est vraiment satisfaisant.', motifId: motifLaser.id, practitionerId: drNadia.id, resourceId: salle3.id, datetime: todayPlusDays(4, 15, 0), sessionId: sessionL1.id })

  // ── Historical appointments for analytics ────────────────
  // Compact helper — short context for historical entries
  async function bookQuick(p: { patientId: string; name: string; email: string; phone: string; status: string; motifId: string; practitionerId: string; resourceId: string; datetime: Date; sessionId: string }) {
    const appt = await prisma.appointment.create({ data: { patientId: p.patientId, name: p.name, email: p.email, phone: p.phone, status: p.status, context: 'Consultation de routine', motifId: p.motifId, practitionerId: p.practitionerId, resourceId: p.resourceId } })
    await prisma.schedule.create({ data: { datetime: p.datetime, sessionId: p.sessionId, appointmentId: appt.id } })
  }

  // ─── YESTERDAY ──────────────────────────────────────────
  // Dr. Ahmed: 3 appointments yesterday
  await bookQuick({ patientId: patKarim.id, name: 'Karim Bensouda', email: 'karim@email.com', phone: '+212600000001', status: 'COMPLETED', motifId: motifConsultation.id, practitionerId: drAhmed.id, resourceId: salle1.id, datetime: todayPlusDays(-1, 9, 0), sessionId: sessionC1.id })
  await bookQuick({ patientId: patHassan.id, name: 'Hassan Tazi', email: 'hassan@email.com', phone: '+212600000003', status: 'COMPLETED', motifId: motifBilan.id, practitionerId: drAhmed.id, resourceId: salle1.id, datetime: todayPlusDays(-1, 10, 0), sessionId: sessionB1.id })
  await bookQuick({ patientId: patRachid.id, name: 'Rachid El Amrani', email: 'rachid@email.com', phone: '+212600000011', status: 'COMPLETED', motifId: motifConsultation.id, practitionerId: drAhmed.id, resourceId: salle1.id, datetime: todayPlusDays(-1, 14, 0), sessionId: sessionC2.id })
  // Dr. Fatima: 2 yesterday
  await bookQuick({ patientId: patAmina.id, name: 'Amina Berrada', email: 'amina@email.com', phone: '+212600000008', status: 'COMPLETED', motifId: motifSuivi.id, practitionerId: drFatima.id, resourceId: salle1.id, datetime: todayPlusDays(-1, 9, 0), sessionId: sessionS1.id })
  await bookQuick({ patientId: patImane.id, name: 'Imane El Khouli', email: 'imane@email.com', phone: '+212600000010', status: 'COMPLETED', motifId: motifPeeling.id, practitionerId: drFatima.id, resourceId: salle3.id, datetime: todayPlusDays(-1, 11, 0), sessionId: sessionP1.id })
  // Dr. Youssef: 2 yesterday
  await bookQuick({ patientId: patMehdi.id, name: 'Mehdi Ouazzani', email: 'mehdi@email.com', phone: '+212600000009', status: 'COMPLETED', motifId: motifDetartrage.id, practitionerId: drYoussef.id, resourceId: salle2.id, datetime: todayPlusDays(-1, 10, 0), sessionId: sessionD1.id })
  await bookQuick({ patientId: patSara.id, name: 'Sara Benabid', email: 'sara@email.com', phone: '+212600000012', status: 'COMPLETED', motifId: motifUrgence.id, practitionerId: drYoussef.id, resourceId: salle2.id, datetime: todayPlusDays(-1, 14, 0), sessionId: sessionU1.id })
  // Dr. Nadia: 1 yesterday
  await bookQuick({ patientId: patFatimaZ.id, name: 'Fatima Zahra', email: 'fatima.z@email.com', phone: '+212600000014', status: 'COMPLETED', motifId: motifLaser.id, practitionerId: drNadia.id, resourceId: salle3.id, datetime: todayPlusDays(-1, 9, 30), sessionId: sessionL1.id })

  // ─── LAST WEEK (Mon-Fri, -7 to -3 from today) ──────────
  // Monday last week (-7)
  await bookQuick({ patientId: patKarim.id, name: 'Karim Bensouda', email: 'karim@email.com', phone: '+212600000001', status: 'COMPLETED', motifId: motifConsultation.id, practitionerId: drAhmed.id, resourceId: salle1.id, datetime: todayPlusDays(-7, 9, 0), sessionId: sessionC1.id })
  await bookQuick({ patientId: patLeila.id, name: 'Leila Benjelloun', email: 'leila@email.com', phone: '+212600000004', status: 'COMPLETED', motifId: motifBilan.id, practitionerId: drAhmed.id, resourceId: salle1.id, datetime: todayPlusDays(-7, 10, 0), sessionId: sessionB1.id })
  await bookQuick({ patientId: patOmar.id, name: 'Omar Idrissi', email: 'omar@email.com', phone: '+212600000005', status: 'COMPLETED', motifId: motifSuivi.id, practitionerId: drFatima.id, resourceId: salle1.id, datetime: todayPlusDays(-7, 9, 0), sessionId: sessionS1.id })
  await bookQuick({ patientId: patNadia.id, name: 'Nadia El Ouafi', email: 'nadia@email.com', phone: '+212600000002', status: 'COMPLETED', motifId: motifDetartrage.id, practitionerId: drYoussef.id, resourceId: salle2.id, datetime: todayPlusDays(-7, 10, 0), sessionId: sessionD1.id })
  await bookQuick({ patientId: patMona.id, name: 'Mona Lahlou', email: 'mona@email.com', phone: '+212600000016', status: 'COMPLETED', motifId: motifLaser.id, practitionerId: drNadia.id, resourceId: salle3.id, datetime: todayPlusDays(-7, 11, 0), sessionId: sessionL1.id })
  // Tuesday last week (-6)
  await bookQuick({ patientId: patHicham.id, name: 'Hicham Bennani', email: 'hicham@email.com', phone: '+212600000015', status: 'COMPLETED', motifId: motifConsultation.id, practitionerId: drAhmed.id, resourceId: salle1.id, datetime: todayPlusDays(-6, 9, 0), sessionId: sessionC3.id })
  await bookQuick({ patientId: patKhalid.id, name: 'Khalid El Fassi', email: 'khalid@email.com', phone: '+212600000017', status: 'COMPLETED', motifId: motifConsultation.id, practitionerId: drAhmed.id, resourceId: salle1.id, datetime: todayPlusDays(-6, 14, 0), sessionId: sessionC4.id })
  await bookQuick({ patientId: patNawal.id, name: 'Nawal Bouchaib', email: 'nawal@email.com', phone: '+212600000018', status: 'COMPLETED', motifId: motifConsultation.id, practitionerId: drFatima.id, resourceId: salle1.id, datetime: todayPlusDays(-6, 9, 0), sessionId: sessionC1.id })
  await bookQuick({ patientId: patSamira.id, name: 'Samira Aït Ali', email: 'samira@email.com', phone: '+212600000006', status: 'COMPLETED', motifId: motifUrgence.id, practitionerId: drYoussef.id, resourceId: salle2.id, datetime: todayPlusDays(-6, 10, 0), sessionId: sessionU1.id })
  await bookQuick({ patientId: patDriss.id, name: 'Driss Berrada', email: 'driss@email.com', phone: '+212600000013', status: 'COMPLETED', motifId: motifConsultation.id, practitionerId: drNadia.id, resourceId: salle1.id, datetime: todayPlusDays(-6, 15, 0), sessionId: sessionC2.id })
  // Wednesday last week (-5)
  await bookQuick({ patientId: patYounes.id, name: 'Younes El Fassi', email: 'younes@email.com', phone: '+212600000007', status: 'COMPLETED', motifId: motifBilan.id, practitionerId: drAhmed.id, resourceId: salle1.id, datetime: todayPlusDays(-5, 9, 0), sessionId: sessionB2.id })
  await bookQuick({ patientId: patAmina.id, name: 'Amina Berrada', email: 'amina@email.com', phone: '+212600000008', status: 'COMPLETED', motifId: motifPeeling.id, practitionerId: drFatima.id, resourceId: salle3.id, datetime: todayPlusDays(-5, 10, 0), sessionId: sessionP1.id })
  await bookQuick({ patientId: patMehdi.id, name: 'Mehdi Ouazzani', email: 'mehdi@email.com', phone: '+212600000009', status: 'COMPLETED', motifId: motifDetartrage.id, practitionerId: drYoussef.id, resourceId: salle2.id, datetime: todayPlusDays(-5, 11, 0), sessionId: sessionD2.id })
  await bookQuick({ patientId: patFatimaZ.id, name: 'Fatima Zahra', email: 'fatima.z@email.com', phone: '+212600000014', status: 'COMPLETED', motifId: motifLaser.id, practitionerId: drNadia.id, resourceId: salle3.id, datetime: todayPlusDays(-5, 14, 0), sessionId: sessionL1.id })
  // Thursday last week (-4)
  await bookQuick({ patientId: patHassan.id, name: 'Hassan Tazi', email: 'hassan@email.com', phone: '+212600000003', status: 'COMPLETED', motifId: motifConsultation.id, practitionerId: drAhmed.id, resourceId: salle1.id, datetime: todayPlusDays(-4, 9, 0), sessionId: sessionC1.id })
  await bookQuick({ patientId: patImane.id, name: 'Imane El Khouli', email: 'imane@email.com', phone: '+212600000010', status: 'COMPLETED', motifId: motifSuivi.id, practitionerId: drFatima.id, resourceId: salle1.id, datetime: todayPlusDays(-4, 9, 0), sessionId: sessionS2.id })
  await bookQuick({ patientId: patSara.id, name: 'Sara Benabid', email: 'sara@email.com', phone: '+212600000012', status: 'COMPLETED', motifId: motifUrgence.id, practitionerId: drYoussef.id, resourceId: salle2.id, datetime: todayPlusDays(-4, 14, 0), sessionId: sessionU2.id })
  await bookQuick({ patientId: patLeila.id, name: 'Leila Benjelloun', email: 'leila@email.com', phone: '+212600000004', status: 'COMPLETED', motifId: motifLaser.id, practitionerId: drNadia.id, resourceId: salle3.id, datetime: todayPlusDays(-4, 16, 0), sessionId: sessionL1.id })
  // Friday last week (-3)
  await bookQuick({ patientId: patRachid.id, name: 'Rachid El Amrani', email: 'rachid@email.com', phone: '+212600000011', status: 'COMPLETED', motifId: motifConsultation.id, practitionerId: drAhmed.id, resourceId: salle1.id, datetime: todayPlusDays(-3, 9, 0), sessionId: sessionC2.id })
  await bookQuick({ patientId: patNawal.id, name: 'Nawal Bouchaib', email: 'nawal@email.com', phone: '+212600000018', status: 'COMPLETED', motifId: motifSuivi.id, practitionerId: drFatima.id, resourceId: salle1.id, datetime: todayPlusDays(-3, 9, 0), sessionId: sessionS1.id })
  await bookQuick({ patientId: patDriss.id, name: 'Driss Berrada', email: 'driss@email.com', phone: '+212600000013', status: 'COMPLETED', motifId: motifDetartrage.id, practitionerId: drYoussef.id, resourceId: salle2.id, datetime: todayPlusDays(-3, 10, 0), sessionId: sessionD1.id })

  // ─── LAST MONTH (week by week, -28 to -14 days) ────────
  // Week 1 of last month (-28 to -24)
  await bookQuick({ patientId: patKarim.id, name: 'Karim Bensouda', email: 'karim@email.com', phone: '+212600000001', status: 'COMPLETED', motifId: motifConsultation.id, practitionerId: drAhmed.id, resourceId: salle1.id, datetime: todayPlusDays(-28, 9, 0), sessionId: sessionC1.id })
  await bookQuick({ patientId: patHassan.id, name: 'Hassan Tazi', email: 'hassan@email.com', phone: '+212600000003', status: 'COMPLETED', motifId: motifBilan.id, practitionerId: drAhmed.id, resourceId: salle1.id, datetime: todayPlusDays(-28, 10, 30), sessionId: sessionB1.id })
  await bookQuick({ patientId: patLeila.id, name: 'Leila Benjelloun', email: 'leila@email.com', phone: '+212600000004', status: 'COMPLETED', motifId: motifConsultation.id, practitionerId: drAhmed.id, resourceId: salle1.id, datetime: todayPlusDays(-27, 9, 0), sessionId: sessionC2.id })
  await bookQuick({ patientId: patOmar.id, name: 'Omar Idrissi', email: 'omar@email.com', phone: '+212600000005', status: 'COMPLETED', motifId: motifSuivi.id, practitionerId: drFatima.id, resourceId: salle1.id, datetime: todayPlusDays(-28, 9, 0), sessionId: sessionS1.id })
  await bookQuick({ patientId: patAmina.id, name: 'Amina Berrada', email: 'amina@email.com', phone: '+212600000008', status: 'COMPLETED', motifId: motifPeeling.id, practitionerId: drFatima.id, resourceId: salle3.id, datetime: todayPlusDays(-27, 10, 0), sessionId: sessionP1.id })
  await bookQuick({ patientId: patNadia.id, name: 'Nadia El Ouafi', email: 'nadia@email.com', phone: '+212600000002', status: 'COMPLETED', motifId: motifDetartrage.id, practitionerId: drYoussef.id, resourceId: salle2.id, datetime: todayPlusDays(-28, 10, 0), sessionId: sessionD1.id })
  await bookQuick({ patientId: patSamira.id, name: 'Samira Aït Ali', email: 'samira@email.com', phone: '+212600000006', status: 'COMPLETED', motifId: motifUrgence.id, practitionerId: drYoussef.id, resourceId: salle2.id, datetime: todayPlusDays(-27, 14, 0), sessionId: sessionU1.id })
  await bookQuick({ patientId: patFatimaZ.id, name: 'Fatima Zahra', email: 'fatima.z@email.com', phone: '+212600000014', status: 'COMPLETED', motifId: motifLaser.id, practitionerId: drNadia.id, resourceId: salle3.id, datetime: todayPlusDays(-28, 14, 0), sessionId: sessionL1.id })
  await bookQuick({ patientId: patMona.id, name: 'Mona Lahlou', email: 'mona@email.com', phone: '+212600000016', status: 'COMPLETED', motifId: motifConsultation.id, practitionerId: drNadia.id, resourceId: salle1.id, datetime: todayPlusDays(-26, 11, 0), sessionId: sessionC1.id })

  // Week 2 of last month (-21 to -17)
  await bookQuick({ patientId: patHicham.id, name: 'Hicham Bennani', email: 'hicham@email.com', phone: '+212600000015', status: 'COMPLETED', motifId: motifConsultation.id, practitionerId: drAhmed.id, resourceId: salle1.id, datetime: todayPlusDays(-21, 9, 0), sessionId: sessionC3.id })
  await bookQuick({ patientId: patKhalid.id, name: 'Khalid El Fassi', email: 'khalid@email.com', phone: '+212600000017', status: 'COMPLETED', motifId: motifConsultation.id, practitionerId: drAhmed.id, resourceId: salle1.id, datetime: todayPlusDays(-21, 14, 0), sessionId: sessionC4.id })
  await bookQuick({ patientId: patRachid.id, name: 'Rachid El Amrani', email: 'rachid@email.com', phone: '+212600000011', status: 'COMPLETED', motifId: motifBilan.id, practitionerId: drAhmed.id, resourceId: salle1.id, datetime: todayPlusDays(-20, 10, 0), sessionId: sessionB2.id })
  await bookQuick({ patientId: patNawal.id, name: 'Nawal Bouchaib', email: 'nawal@email.com', phone: '+212600000018', status: 'COMPLETED', motifId: motifConsultation.id, practitionerId: drFatima.id, resourceId: salle1.id, datetime: todayPlusDays(-21, 9, 0), sessionId: sessionC1.id })
  await bookQuick({ patientId: patImane.id, name: 'Imane El Khouli', email: 'imane@email.com', phone: '+212600000010', status: 'COMPLETED', motifId: motifSuivi.id, practitionerId: drFatima.id, resourceId: salle1.id, datetime: todayPlusDays(-20, 9, 30), sessionId: sessionS2.id })
  await bookQuick({ patientId: patMehdi.id, name: 'Mehdi Ouazzani', email: 'mehdi@email.com', phone: '+212600000009', status: 'COMPLETED', motifId: motifDetartrage.id, practitionerId: drYoussef.id, resourceId: salle2.id, datetime: todayPlusDays(-21, 10, 0), sessionId: sessionD2.id })
  await bookQuick({ patientId: patSara.id, name: 'Sara Benabid', email: 'sara@email.com', phone: '+212600000012', status: 'COMPLETED', motifId: motifUrgence.id, practitionerId: drYoussef.id, resourceId: salle2.id, datetime: todayPlusDays(-19, 14, 0), sessionId: sessionU2.id })
  await bookQuick({ patientId: patLeila.id, name: 'Leila Benjelloun', email: 'leila@email.com', phone: '+212600000004', status: 'COMPLETED', motifId: motifLaser.id, practitionerId: drNadia.id, resourceId: salle3.id, datetime: todayPlusDays(-21, 16, 0), sessionId: sessionL1.id })

  // Week 3 of last month (-14 to -10)
  await bookQuick({ patientId: patYounes.id, name: 'Younes El Fassi', email: 'younes@email.com', phone: '+212600000007', status: 'COMPLETED', motifId: motifConsultation.id, practitionerId: drAhmed.id, resourceId: salle1.id, datetime: todayPlusDays(-14, 9, 0), sessionId: sessionC1.id })
  await bookQuick({ patientId: patKarim.id, name: 'Karim Bensouda', email: 'karim@email.com', phone: '+212600000001', status: 'COMPLETED', motifId: motifBilan.id, practitionerId: drAhmed.id, resourceId: salle1.id, datetime: todayPlusDays(-14, 10, 30), sessionId: sessionB1.id })
  await bookQuick({ patientId: patHassan.id, name: 'Hassan Tazi', email: 'hassan@email.com', phone: '+212600000003', status: 'COMPLETED', motifId: motifConsultation.id, practitionerId: drAhmed.id, resourceId: salle1.id, datetime: todayPlusDays(-13, 14, 0), sessionId: sessionC2.id })
  await bookQuick({ patientId: patSamira.id, name: 'Samira Aït Ali', email: 'samira@email.com', phone: '+212600000006', status: 'COMPLETED', motifId: motifConsultation.id, practitionerId: drFatima.id, resourceId: salle1.id, datetime: todayPlusDays(-14, 9, 0), sessionId: sessionC1.id })
  await bookQuick({ patientId: patAmina.id, name: 'Amina Berrada', email: 'amina@email.com', phone: '+212600000008', status: 'COMPLETED', motifId: motifSuivi.id, practitionerId: drFatima.id, resourceId: salle1.id, datetime: todayPlusDays(-13, 9, 0), sessionId: sessionS1.id })
  await bookQuick({ patientId: patDriss.id, name: 'Driss Berrada', email: 'driss@email.com', phone: '+212600000013', status: 'COMPLETED', motifId: motifDetartrage.id, practitionerId: drYoussef.id, resourceId: salle2.id, datetime: todayPlusDays(-14, 10, 0), sessionId: sessionD1.id })
  await bookQuick({ patientId: patNadia.id, name: 'Nadia El Ouafi', email: 'nadia@email.com', phone: '+212600000002', status: 'COMPLETED', motifId: motifUrgence.id, practitionerId: drYoussef.id, resourceId: salle2.id, datetime: todayPlusDays(-12, 14, 0), sessionId: sessionU1.id })
  await bookQuick({ patientId: patFatimaZ.id, name: 'Fatima Zahra', email: 'fatima.z@email.com', phone: '+212600000014', status: 'COMPLETED', motifId: motifLaser.id, practitionerId: drNadia.id, resourceId: salle3.id, datetime: todayPlusDays(-14, 14, 0), sessionId: sessionL1.id })
  await bookQuick({ patientId: patMona.id, name: 'Mona Lahlou', email: 'mona@email.com', phone: '+212600000016', status: 'COMPLETED', motifId: motifConsultation.id, practitionerId: drNadia.id, resourceId: salle1.id, datetime: todayPlusDays(-11, 11, 0), sessionId: sessionC2.id })

  // ─── EARLIER THIS YEAR (2-5 months ago) ────────────────
  // ~2 months ago
  await bookQuick({ patientId: patKarim.id, name: 'Karim Bensouda', email: 'karim@email.com', phone: '+212600000001', status: 'COMPLETED', motifId: motifConsultation.id, practitionerId: drAhmed.id, resourceId: salle1.id, datetime: todayPlusDays(-60, 9, 0), sessionId: sessionC1.id })
  await bookQuick({ patientId: patHassan.id, name: 'Hassan Tazi', email: 'hassan@email.com', phone: '+212600000003', status: 'COMPLETED', motifId: motifBilan.id, practitionerId: drAhmed.id, resourceId: salle1.id, datetime: todayPlusDays(-60, 10, 30), sessionId: sessionB1.id })
  await bookQuick({ patientId: patLeila.id, name: 'Leila Benjelloun', email: 'leila@email.com', phone: '+212600000004', status: 'COMPLETED', motifId: motifConsultation.id, practitionerId: drAhmed.id, resourceId: salle1.id, datetime: todayPlusDays(-59, 14, 0), sessionId: sessionC2.id })
  await bookQuick({ patientId: patHicham.id, name: 'Hicham Bennani', email: 'hicham@email.com', phone: '+212600000015', status: 'COMPLETED', motifId: motifConsultation.id, practitionerId: drAhmed.id, resourceId: salle1.id, datetime: todayPlusDays(-58, 9, 0), sessionId: sessionC3.id })
  await bookQuick({ patientId: patOmar.id, name: 'Omar Idrissi', email: 'omar@email.com', phone: '+212600000005', status: 'COMPLETED', motifId: motifSuivi.id, practitionerId: drFatima.id, resourceId: salle1.id, datetime: todayPlusDays(-60, 9, 0), sessionId: sessionS1.id })
  await bookQuick({ patientId: patAmina.id, name: 'Amina Berrada', email: 'amina@email.com', phone: '+212600000008', status: 'COMPLETED', motifId: motifPeeling.id, practitionerId: drFatima.id, resourceId: salle3.id, datetime: todayPlusDays(-59, 10, 0), sessionId: sessionP1.id })
  await bookQuick({ patientId: patNawal.id, name: 'Nawal Bouchaib', email: 'nawal@email.com', phone: '+212600000018', status: 'COMPLETED', motifId: motifConsultation.id, practitionerId: drFatima.id, resourceId: salle1.id, datetime: todayPlusDays(-58, 14, 0), sessionId: sessionC1.id })
  await bookQuick({ patientId: patNadia.id, name: 'Nadia El Ouafi', email: 'nadia@email.com', phone: '+212600000002', status: 'COMPLETED', motifId: motifDetartrage.id, practitionerId: drYoussef.id, resourceId: salle2.id, datetime: todayPlusDays(-60, 10, 0), sessionId: sessionD1.id })
  await bookQuick({ patientId: patSamira.id, name: 'Samira Aït Ali', email: 'samira@email.com', phone: '+212600000006', status: 'COMPLETED', motifId: motifUrgence.id, practitionerId: drYoussef.id, resourceId: salle2.id, datetime: todayPlusDays(-59, 14, 0), sessionId: sessionU1.id })
  await bookQuick({ patientId: patMehdi.id, name: 'Mehdi Ouazzani', email: 'mehdi@email.com', phone: '+212600000009', status: 'COMPLETED', motifId: motifDetartrage.id, practitionerId: drYoussef.id, resourceId: salle2.id, datetime: todayPlusDays(-58, 11, 0), sessionId: sessionD2.id })
  await bookQuick({ patientId: patFatimaZ.id, name: 'Fatima Zahra', email: 'fatima.z@email.com', phone: '+212600000014', status: 'COMPLETED', motifId: motifLaser.id, practitionerId: drNadia.id, resourceId: salle3.id, datetime: todayPlusDays(-60, 14, 0), sessionId: sessionL1.id })
  await bookQuick({ patientId: patMona.id, name: 'Mona Lahlou', email: 'mona@email.com', phone: '+212600000016', status: 'COMPLETED', motifId: motifConsultation.id, practitionerId: drNadia.id, resourceId: salle1.id, datetime: todayPlusDays(-59, 15, 0), sessionId: sessionC2.id })

  // ~3 months ago
  await bookQuick({ patientId: patRachid.id, name: 'Rachid El Amrani', email: 'rachid@email.com', phone: '+212600000011', status: 'COMPLETED', motifId: motifConsultation.id, practitionerId: drAhmed.id, resourceId: salle1.id, datetime: todayPlusDays(-90, 9, 0), sessionId: sessionC1.id })
  await bookQuick({ patientId: patKhalid.id, name: 'Khalid El Fassi', email: 'khalid@email.com', phone: '+212600000017', status: 'COMPLETED', motifId: motifBilan.id, practitionerId: drAhmed.id, resourceId: salle1.id, datetime: todayPlusDays(-90, 10, 0), sessionId: sessionB2.id })
  await bookQuick({ patientId: patYounes.id, name: 'Younes El Fassi', email: 'younes@email.com', phone: '+212600000007', status: 'COMPLETED', motifId: motifConsultation.id, practitionerId: drAhmed.id, resourceId: salle1.id, datetime: todayPlusDays(-89, 14, 0), sessionId: sessionC2.id })
  await bookQuick({ patientId: patImane.id, name: 'Imane El Khouli', email: 'imane@email.com', phone: '+212600000010', status: 'COMPLETED', motifId: motifSuivi.id, practitionerId: drFatima.id, resourceId: salle1.id, datetime: todayPlusDays(-90, 9, 0), sessionId: sessionS1.id })
  await bookQuick({ patientId: patSamira.id, name: 'Samira Aït Ali', email: 'samira@email.com', phone: '+212600000006', status: 'COMPLETED', motifId: motifPeeling.id, practitionerId: drFatima.id, resourceId: salle3.id, datetime: todayPlusDays(-89, 10, 0), sessionId: sessionP1.id })
  await bookQuick({ patientId: patSara.id, name: 'Sara Benabid', email: 'sara@email.com', phone: '+212600000012', status: 'COMPLETED', motifId: motifDetartrage.id, practitionerId: drYoussef.id, resourceId: salle2.id, datetime: todayPlusDays(-90, 10, 0), sessionId: sessionD1.id })
  await bookQuick({ patientId: patDriss.id, name: 'Driss Berrada', email: 'driss@email.com', phone: '+212600000013', status: 'COMPLETED', motifId: motifUrgence.id, practitionerId: drYoussef.id, resourceId: salle2.id, datetime: todayPlusDays(-89, 14, 0), sessionId: sessionU1.id })
  await bookQuick({ patientId: patLeila.id, name: 'Leila Benjelloun', email: 'leila@email.com', phone: '+212600000004', status: 'COMPLETED', motifId: motifLaser.id, practitionerId: drNadia.id, resourceId: salle3.id, datetime: todayPlusDays(-90, 16, 0), sessionId: sessionL1.id })

  // ~4 months ago
  await bookQuick({ patientId: patKarim.id, name: 'Karim Bensouda', email: 'karim@email.com', phone: '+212600000001', status: 'COMPLETED', motifId: motifConsultation.id, practitionerId: drAhmed.id, resourceId: salle1.id, datetime: todayPlusDays(-120, 9, 0), sessionId: sessionC1.id })
  await bookQuick({ patientId: patHassan.id, name: 'Hassan Tazi', email: 'hassan@email.com', phone: '+212600000003', status: 'COMPLETED', motifId: motifConsultation.id, practitionerId: drAhmed.id, resourceId: salle1.id, datetime: todayPlusDays(-120, 14, 0), sessionId: sessionC4.id })
  await bookQuick({ patientId: patLeila.id, name: 'Leila Benjelloun', email: 'leila@email.com', phone: '+212600000004', status: 'COMPLETED', motifId: motifBilan.id, practitionerId: drAhmed.id, resourceId: salle1.id, datetime: todayPlusDays(-119, 10, 0), sessionId: sessionB1.id })
  await bookQuick({ patientId: patOmar.id, name: 'Omar Idrissi', email: 'omar@email.com', phone: '+212600000005', status: 'COMPLETED', motifId: motifSuivi.id, practitionerId: drFatima.id, resourceId: salle1.id, datetime: todayPlusDays(-120, 9, 0), sessionId: sessionS1.id })
  await bookQuick({ patientId: patAmina.id, name: 'Amina Berrada', email: 'amina@email.com', phone: '+212600000008', status: 'COMPLETED', motifId: motifConsultation.id, practitionerId: drFatima.id, resourceId: salle1.id, datetime: todayPlusDays(-119, 10, 0), sessionId: sessionC1.id })
  await bookQuick({ patientId: patNadia.id, name: 'Nadia El Ouafi', email: 'nadia@email.com', phone: '+212600000002', status: 'COMPLETED', motifId: motifDetartrage.id, practitionerId: drYoussef.id, resourceId: salle2.id, datetime: todayPlusDays(-120, 10, 0), sessionId: sessionD1.id })
  await bookQuick({ patientId: patMehdi.id, name: 'Mehdi Ouazzani', email: 'mehdi@email.com', phone: '+212600000009', status: 'COMPLETED', motifId: motifUrgence.id, practitionerId: drYoussef.id, resourceId: salle2.id, datetime: todayPlusDays(-119, 14, 0), sessionId: sessionU1.id })
  await bookQuick({ patientId: patFatimaZ.id, name: 'Fatima Zahra', email: 'fatima.z@email.com', phone: '+212600000014', status: 'COMPLETED', motifId: motifLaser.id, practitionerId: drNadia.id, resourceId: salle3.id, datetime: todayPlusDays(-120, 14, 0), sessionId: sessionL1.id })

  // ~5 months ago
  await bookQuick({ patientId: patHicham.id, name: 'Hicham Bennani', email: 'hicham@email.com', phone: '+212600000015', status: 'COMPLETED', motifId: motifConsultation.id, practitionerId: drAhmed.id, resourceId: salle1.id, datetime: todayPlusDays(-150, 9, 0), sessionId: sessionC1.id })
  await bookQuick({ patientId: patKhalid.id, name: 'Khalid El Fassi', email: 'khalid@email.com', phone: '+212600000017', status: 'COMPLETED', motifId: motifBilan.id, practitionerId: drAhmed.id, resourceId: salle1.id, datetime: todayPlusDays(-150, 10, 30), sessionId: sessionB1.id })
  await bookQuick({ patientId: patRachid.id, name: 'Rachid El Amrani', email: 'rachid@email.com', phone: '+212600000011', status: 'COMPLETED', motifId: motifConsultation.id, practitionerId: drAhmed.id, resourceId: salle1.id, datetime: todayPlusDays(-149, 14, 0), sessionId: sessionC2.id })
  await bookQuick({ patientId: patNawal.id, name: 'Nawal Bouchaib', email: 'nawal@email.com', phone: '+212600000018', status: 'COMPLETED', motifId: motifSuivi.id, practitionerId: drFatima.id, resourceId: salle1.id, datetime: todayPlusDays(-150, 9, 0), sessionId: sessionS1.id })
  await bookQuick({ patientId: patImane.id, name: 'Imane El Khouli', email: 'imane@email.com', phone: '+212600000010', status: 'COMPLETED', motifId: motifPeeling.id, practitionerId: drFatima.id, resourceId: salle3.id, datetime: todayPlusDays(-149, 10, 0), sessionId: sessionP1.id })
  await bookQuick({ patientId: patSara.id, name: 'Sara Benabid', email: 'sara@email.com', phone: '+212600000012', status: 'COMPLETED', motifId: motifDetartrage.id, practitionerId: drYoussef.id, resourceId: salle2.id, datetime: todayPlusDays(-150, 10, 0), sessionId: sessionD1.id })
  await bookQuick({ patientId: patDriss.id, name: 'Driss Berrada', email: 'driss@email.com', phone: '+212600000013', status: 'COMPLETED', motifId: motifDetartrage.id, practitionerId: drYoussef.id, resourceId: salle2.id, datetime: todayPlusDays(-149, 11, 0), sessionId: sessionD2.id })
  await bookQuick({ patientId: patMona.id, name: 'Mona Lahlou', email: 'mona@email.com', phone: '+212600000016', status: 'COMPLETED', motifId: motifLaser.id, practitionerId: drNadia.id, resourceId: salle3.id, datetime: todayPlusDays(-150, 14, 0), sessionId: sessionL1.id })

  // ── Contacts ───────────────────────────────────────────
  await prisma.contact.createMany({
    data: [
      { name: 'Rachid El Amrani', email: 'rachid@email.com', phone: '+212611111111', context: 'Bonjour, je souffre de maux de tête persistants depuis plusieurs semaines, avec des douleurs qui apparaissent surtout en fin de journée. J\'ai déjà consulté un généraliste qui m\'a prescrit du paracétamol mais cela ne fait aucun effet. Je souhaiterais consulter un neurologue pour explorer la cause de ces céphalées. Pourriez-vous me dire quels sont les délais pour obtenir un rendez-vous et si je dois apporter mes examens précédents ? J\'ai des antécédents familiaux de migraines, ma mère et ma grand-mère en souffraient régulièrement, mais mes symptômes ne ressemblent pas vraiment à des migraines classiques car je n\'ai pas d\'aura visuelle, pas de nausées, et la douleur n\'est pas pulsatile mais plutôt diffuse et constante, comme une pression sur tout le crâne. Elle commence en milieu de matinée vers 10h-11h et s\'intensifie progressivement jusqu\'en fin de journée pour atteindre son pic vers 18h-19h. Le week-end, quand je ne travaille pas, les douleurs sont moins fortes voire absentes, ce qui me fait penser qu\'il y a une composante liée au stress ou à la posture au travail. Je travaille dans un open space avec beaucoup d\'écrans et de lumière artificielle, je passe environ 9 heures par jour devant un ordinateur. J\'ai déjà essayé de régler la luminosité de mon écran et de prendre des pauses régulières mais ça n\'a pas amélioré la situation de manière significative. J\'ai aussi consulté un ophtalmologue l\'année dernière qui m\'a dit que ma vue était correcte et que je n\'avais pas besoin de lunettes. Un ostéopathe m\'a dit que mes cervicales étaient très bloquées et m\'a fait quelques manipulations qui ont soulagé temporairement la douleur pendant quelques heures mais elle est revenue le lendemain. Je me demande si je devrais faire un scanner cérébral pour écarter des causes plus graves, même si mon généraliste m\'a dit que c\'était probablement des céphalées de tension. J\'ai 45 ans, je ne fume pas, je bois peu d\'alcool, et je n\'ai jamais eu de problème neurologique de ma vie. Je suis prêt à payer une consultation en privé si les délais du public sont trop longs, et je peux me libérer à n\'importe quel moment de la journée en prévenant mon employeur 48h à l\'avance. Merci d\'avance pour votre retour et votre aide précieuse.', read: false },
      { name: 'Sara Benabid', email: 'sara@email.com', phone: '+212622222222', context: 'Bonjour, j\'ai une douleur dentaire intense depuis hier soir et je n\'arrive plus à manger correctement. La douleur est localisée au niveau de la molaire inférieure gauche et elle est sensible au chaud comme au froid. J\'ai pris de l\'ibuprofène mais la douleur revient dès que l\'effet passe. Est-ce que vous prenez en charge les urgences dentaires le weekend ? J\'aimerais venir dès que possible.', read: false },
      { name: 'Mehdi Ouazzani', email: 'mehdi@email.com', phone: '+212633333333', context: 'Bonjour, je voudrais connaître les tarifs pour un bilan cardiaque complet avec échographie. Mon médecin traitant m\'a recommandé de faire ce contrôle suite à des palpitations que je ressens depuis quelques mois. J\'ai 52 ans et je n\'ai jamais fait de bilan cardiaque approfondi. Est-ce que le bilan est pris en charge par la CNSS et combien de temps dure la consultation ?', read: true },
      { name: 'Imane El Khouli', email: 'imane@email.com', phone: '+212644444444', context: 'Bonjour, mon fils âgé de 5 ans a besoin d\'un vaccin pour l\'école et je n\'arrive pas à trouver de disponibilité dans les centres proches de chez nous. C\'est le vaccin DTCoq que son pédiatre lui a prescrit pour son entrée en CP. Quel est le délai pour obtenir un rendez-vous chez vous ? Avez-vous des créneaux en soirée après 17h pour ne pas le déscolariser ?', read: false },
      { name: 'Driss Berrada', email: 'driss@email.com', phone: '+212655555555', context: 'Bonjour, je suis médecin généraliste installé à Casablanca et je souhaiterais explorer une potentielle collaboration avec votre clinique pour des références de patients. Je reçois régulièrement des patients qui nécessitent des consultations spécialisées que vous proposez. Avez-vous un responsable des partenariats que je pourrais contacter pour discuter des modalités ? Je suis disponible pour une rencontre cette semaine ou la semaine prochaine selon votre agenda.', read: false },
      { name: 'Fatima Zahra', email: 'fatima.z@email.com', phone: '+212666666666', context: 'Bonjour, j\'ai actuellement un rendez-vous prévu lundi prochain chez le Dr. Ahmed mais finalement je ne peux pas me libérer ce jour-là pour des raisons professionnelles. Serait-il possible de le déplacer à mardi à la même heure ou dans l\'après-midi si le créneau du matin n\'est pas libre ? C\'est pour une consultation de suivi cardiaque de routine. Merci de me tenir au courant des créneaux disponibles.', read: false },
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
