import { Controller, Get, Query, Req, UseGuards } from "@nestjs/common";
import { SearchService } from "./search.service";
import { AuthGuard } from "@/auth/auth.guard";

@UseGuards(AuthGuard)
@Controller("search")
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get()
  search(@Query("q") q: string, @Req() req: { user: { id: string; role: string } }) {
    return this.searchService.search(q ?? "", req.user);
  }
}
