import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { PrismaService } from "@/prisma/prisma.service";

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private jwt: JwtService,
    private prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const auth = req.headers.authorization;

    if (!auth)
      throw new UnauthorizedException({
        message: "No authorization header",
        code: "no_auth_header",
      });

    try {
      const token = auth.split(" ")[1];
      const payload = this.jwt.verify<{ id: string }>(token, {
        secret: process.env.JWT_SECRET,
      });

      const user = await this.prisma.user.findUnique({
        where: { id: payload.id },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          admin: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      if (!user)
        throw new UnauthorizedException({
          message: "User not found",
          code: "user_not_found",
        });

      req.user = user;
      return true;
    } catch (e) {
      if (e instanceof UnauthorizedException) throw e;
      throw new UnauthorizedException({
        message: "Invalid or expired token",
        code: "invalid_token",
      });
    }
  }
}
