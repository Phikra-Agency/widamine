import { PrismaService } from "@/prisma/prisma.service";
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  mixin,
  NotFoundException,
  Type,
  UnauthorizedException,
} from "@nestjs/common";

export const RoleGuard = (...roles: string[]): Type<CanActivate> => {
  @Injectable()
  class RoleGuardMixin implements CanActivate {
    constructor(private prismaService: PrismaService) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
      const req = context.switchToHttp().getRequest();

      const user = await this.prismaService.user.findUnique({
        where: { id: req.user.id },
      });

      if (!user) throw new NotFoundException("User Not Found");

      if (!roles.includes(user.role))
        throw new UnauthorizedException("Insufficient permissions");

      return true;
    }
  }

  return mixin(RoleGuardMixin);
};
