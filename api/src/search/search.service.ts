import { Injectable } from "@nestjs/common";
import { PrismaService } from "@/prisma/prisma.service";
import { Role } from "@/enums";

interface SearchUser {
  id: string;
  role: string;
}

@Injectable()
export class SearchService {
  constructor(private readonly prisma: PrismaService) {}

  async search(q: string, user: SearchUser) {
    const term = q.trim()
    if (!term) return { patients: [], appointments: [], contacts: [], users: [] }

    const isDoctor = user.role === "DOCTOR" || user.role === "PRACTITIONER"

    const patientWhere = isDoctor
      ? { appointments: { some: { practitionerId: user.id } } }
      : {}

    const [patients, appointments, contacts, users] = await Promise.all([
      this.prisma.patient.findMany({
        where: {
          ...patientWhere,
          OR: [
            { firstName: { contains: term, mode: 'insensitive' } },
            { lastName: { contains: term, mode: 'insensitive' } },
            { email: { contains: term, mode: 'insensitive' } },
            { phone: { contains: term, mode: 'insensitive' } },
          ],
        },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          phone: true,
        },
        take: 5,
      }),
      this.prisma.appointment.findMany({
        where: {
          ...(isDoctor ? { practitionerId: user.id } : {}),
          OR: [
            { name: { contains: term, mode: 'insensitive' } },
            { email: { contains: term, mode: 'insensitive' } },
            { phone: { contains: term, mode: 'insensitive' } },
          ],
        },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          status: true,
        },
        take: 5,
      }),
      isDoctor
        ? Promise.resolve([])
        : this.prisma.contact.findMany({
            where: {
              OR: [
                { name: { contains: term, mode: 'insensitive' } },
                { email: { contains: term, mode: 'insensitive' } },
                { context: { contains: term, mode: 'insensitive' } },
              ],
            },
            select: {
              id: true,
              name: true,
              email: true,
              context: true,
              read: true,
            },
            take: 5,
          }),
      isDoctor
        ? Promise.resolve([])
        : this.prisma.user.findMany({
            where: {
              OR: [
                { name: { contains: term, mode: 'insensitive' } },
                { email: { contains: term, mode: 'insensitive' } },
              ],
            },
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
            },
            take: 5,
          }),
    ])

    return { patients, appointments, contacts, users }
  }
}
