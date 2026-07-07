import { Injectable } from "@nestjs/common";
import { PrismaService } from "@/prisma/prisma.service";

@Injectable()
export class SearchService {
  constructor(private readonly prisma: PrismaService) {}

  async search(q: string) {
    const term = q.trim()
    if (!term) return { patients: [], appointments: [], contacts: [], users: [] }

    const [patients, appointments, contacts, users] = await Promise.all([
      this.searchCollection("Patient", ["firstName", "lastName", "email", "phone"], term, { firstName: 1, lastName: 1, email: 1, phone: 1 }),
      this.searchCollection("Appointment", ["name", "email", "phone"], term, { name: 1, email: 1, phone: 1, status: 1 }),
      this.searchCollection("Contact", ["name", "email", "context"], term, { name: 1, email: 1, context: 1, read: 1 }),
      this.searchCollection("User", ["name", "email"], term, { name: 1, email: 1, role: 1 }),
    ])

    return { patients, appointments, contacts, users }
  }

  private async searchCollection(
    collection: string,
    fields: string[],
    term: string,
    projection: Record<string, number>,
    limit = 5,
  ) {
    const result = await this.prisma.$runCommandRaw({
      find: collection,
      filter: {
        $or: fields.map((f) => ({ [f]: { $regex: term, $options: "i" } })),
      },
      limit,
      projection: { _id: 1, ...projection },
    }) as any

    const batch = result?.cursor?.firstBatch ?? []
    return batch.map((item: any) => {
      const mapped: Record<string, any> = { id: String(item._id?.$oid ?? item._id) }
      for (const key of Object.keys(projection)) {
        if (item[key] !== undefined) mapped[key] = item[key]
      }
      return mapped
    })
  }
}
