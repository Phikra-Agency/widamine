import { Injectable } from '@nestjs/common'
import { PrismaService } from '@/prisma/prisma.service'

@Injectable()
export class ClinicInfoService {
  constructor(private readonly prisma: PrismaService) {}

  async getAppointmentStats(period?: string) {
    const now = new Date()
    let startDate = new Date()

    // Default to current week
    if (!period || period === 'week') {
      startDate.setDate(now.getDate() - 7)
    } else if (period === 'month') {
      startDate.setMonth(now.getMonth() - 1)
    } else if (period === 'today') {
      startDate.setHours(0, 0, 0, 0)
    }

    const appointments = await this.prisma.appointment.findMany({
      where: {
        createdAt: {
          gte: startDate,
        },
      },
      include: {
        motif: {
          select: { name: true },
        },
        practitioner: {
          select: { name: true, role: true },
        },
      },
    })

    const total = appointments.length
    const byStatus = appointments.reduce((acc, apt) => {
      acc[apt.status] = (acc[apt.status] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const byMotif = appointments.reduce((acc, apt) => {
      const motifName = apt.motif.name
      acc[motifName] = (acc[motifName] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    return {
      period: period || 'week',
      total,
      byStatus,
      byMotif,
      upcoming: appointments.filter(a => a.status === 'CONFIRMED').length,
      completed: appointments.filter(a => a.status === 'COMPLETED').length,
      pending: appointments.filter(a => a.status === 'PENDING').length,
      cancelled: appointments.filter(a => a.status === 'CANCELLED').length,
    }
  }

  async getAvailableServices() {
    const motifs = await this.prisma.motif.findMany({
      where: { isActive: true },
      include: {
        practitionerAssignments: {
          where: { isActive: true },
          include: {
            practitioner: {
              select: { name: true, role: true },
            },
          },
        },
        sessions: {
          select: { number: true, duration: true },
        },
      },
      orderBy: { name: 'asc' },
    })

    return motifs.map(motif => ({
      id: motif.id,
      name: motif.name,
      slug: motif.slug,
      description: motif.description,
      duration: motif.duration,
      numberOfSessions: motif.numberOfSessions,
      isOnlineBookable: motif.isOnlineBookable,
      availablePractitioners: motif.practitionerAssignments.map(pa => pa.practitioner.name),
      practitionerCount: motif.practitionerAssignments.length,
    }))
  }

  async getServicesByPractitioner() {
    const practitioners = await this.prisma.user.findMany({
      where: {
        role: { in: ['DOCTOR', 'PRACTITIONER'] },
      },
      include: {
        motifAssignments: {
          where: { isActive: true },
          include: {
            motif: {
              select: {
                name: true,
                slug: true,
                description: true,
                duration: true,
              },
            },
          },
        },
      },
      orderBy: { name: 'asc' },
    })

    return practitioners.map(practitioner => ({
      id: practitioner.id,
      name: practitioner.name,
      role: practitioner.role,
      services: practitioner.motifAssignments.map(ma => ({
        name: ma.motif.name,
        slug: ma.motif.slug,
        description: ma.motif.description,
        duration: ma.motif.duration,
        isPreferred: ma.isPreferred,
      })),
      serviceCount: practitioner.motifAssignments.length,
    }))
  }

  async getPractitionersAvailability() {
    const practitioners = await this.prisma.user.findMany({
      where: {
        role: { in: ['DOCTOR', 'PRACTITIONER'] },
      },
      include: {
        assignedAppointments: {
          where: {
            status: 'CONFIRMED',
            schedules: {
              some: {
                datetime: {
                  gte: new Date(),
                },
              },
            },
          },
          include: {
            motif: {
              select: { name: true },
            },
            schedules: {
              where: {
                datetime: {
                  gte: new Date(),
                },
              },
              orderBy: { datetime: 'asc' },
              take: 1,
            },
          },
        },
      },
      orderBy: { name: 'asc' },
    })

    return practitioners.map(practitioner => ({
      id: practitioner.id,
      name: practitioner.name,
      role: practitioner.role,
      upcomingAppointments: practitioner.assignedAppointments.length,
      nextAppointment: practitioner.assignedAppointments[0]?.schedules[0]
        ? {
            datetime: practitioner.assignedAppointments[0].schedules[0].datetime,
            motif: practitioner.assignedAppointments[0].motif.name,
          }
        : null,
      isAvailable: practitioner.assignedAppointments.length === 0,
    }))
  }

  getBusinessHours() {
    return {
      name: 'Widamine Aesthetic Center',
      address: 'Boulevard Slaoui, Bureaux Nour, 2ème étage, Fès',
      phone: '+212 (535) 624 696',
      email: 'info@widamineaestheticcenter.com',
      hours: {
        monday: { open: '09:00', close: '18:00' },
        tuesday: { open: '09:00', close: '18:00' },
        wednesday: { open: '09:00', close: '18:00' },
        thursday: { open: '09:00', close: '18:00' },
        friday: { open: '09:00', close: '18:00' },
        saturday: { open: '09:00', close: '13:00' },
        sunday: 'closed',
      },
      hoursText: 'Lundi - Vendredi : 9h00 - 18h00\nSamedi : 9h00 - 13h00\nDimanche : Fermé',
    }
  }
}
