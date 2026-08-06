import { Controller, Get } from "@nestjs/common";
import { MotifService } from "./motif.service";

@Controller("public/motifs")
export class PublicMotifController {
  constructor(private readonly motifService: MotifService) {}

  @Get()
  async findAll() {
    const motifs = await this.motifService.findAll();
    return motifs.map(({ id, name, slug, description, color, duration, category }) => ({
      id, name, slug, description, color, duration, category,
    }));
  }
}
