import { Controller, Get } from "@nestjs/common";
import { MotifService } from "./motif.service";

@Controller("public/motifs")
export class PublicMotifController {
  constructor(private readonly motifService: MotifService) {}

  @Get()
  async findAll() {
    const motifs = await this.motifService.findAll();
    console.log('[PublicMotifController] Sample motif from service:', JSON.stringify(motifs[0], null, 2));
    return motifs.map((motif) => {
      const result = {
        id: motif.id,
        name: motif.name,
        slug: motif.slug,
        description: motif.description,
        color: motif.color,
        duration: motif.duration,
        category: motif.category,
      };
      console.log('[PublicMotifController] Mapping result:', JSON.stringify(result, null, 2));
      return result;
    });
  }
}
