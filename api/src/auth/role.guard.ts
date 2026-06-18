import {
  CanActivate,
  ExecutionContext,
  Injectable,
  mixin,
  ForbiddenException,
  Type,
} from "@nestjs/common";

export const RoleGuard = (...roles: string[]): Type<CanActivate> => {
  @Injectable()
  class RoleGuardMixin implements CanActivate {
    canActivate(context: ExecutionContext): boolean {
      const req = context.switchToHttp().getRequest();
      const user = req.user;

      if (!user) throw new ForbiddenException("Not authenticated");
      if (!roles.includes(user.role))
        throw new ForbiddenException("Insufficient permissions");

      return true;
    }
  }

  return mixin(RoleGuardMixin);
};
