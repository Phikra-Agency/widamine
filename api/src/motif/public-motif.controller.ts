import { Controller, Get } from "@nestjs/common";
import { MotifService } from "./motif.service";

@Controller("public/motifs")
export class PublicMotifController {
  constructor(private readonly motifService: MotifService) {}

  @Get()
  async findAll() {
    const motifs = await this.motifService.findAll();
    // Filter only active and online-bookable services for public display
    return motifs
      .filter((motif) => motif.isActive && motif.isOnlineBookable)
      .map((motif) => ({
        id: motif.id,
        name: motif.name,
        slug: motif.slug,
        description: motif.description,
        color: motif.color,
        duration: motif.duration,
        category: motif.category,
        isOnlineBookable: motif.isOnlineBookable,
        isActive: motif.isActive,
      }));
  }
}
