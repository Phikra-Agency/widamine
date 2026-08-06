import { Controller, Get } from "@nestjs/common";
import { MotifService } from "./motif.service";

@Controller("public/motifs")
export class PublicMotifController {
  constructor(private readonly motifService: MotifService) {}

  @Get()
  async findAll() {
    const motifs = await this.motifService.findAll();
    return motifs.map((motif) => ({
      id: motif.id,
      name: motif.name,
      slug: motif.slug,
      description: motif.description,
      color: motif.color,
      duration: motif.duration,
      category: motif.category,
    }));
  }
}
