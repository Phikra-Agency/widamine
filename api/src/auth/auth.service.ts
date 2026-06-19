import { PrismaService } from "@/prisma/prisma.service";
import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { LoginDto } from "./dto/login.dto";
import { CheckEmailDto } from "./dto/check-email.dto";
import { Request, Response } from "express";
import * as bcrypt from "bcrypt";

@Injectable()
export class AuthService {
  constructor(
    private prismaService: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async checkEmail({ email }: CheckEmailDto) {
    const user = await this.prismaService.user.findUnique({
      where: { email },
      select: { name: true, email: true, role: true, image: true },
    });

    if (!user) throw new NotFoundException({ email: "email_not_found" });

    return { user };
  }

  async login(loginDto: LoginDto, res: Response) {
    const user = await this.prismaService.user.findUnique({
      where: { email: loginDto.email },
    });

    if (!user) throw new NotFoundException({ email: "email_not_found" });

    const valid = await bcrypt.compare(loginDto.password, user.password);
    if (!valid) throw new UnauthorizedException({ password: "wrong_password" });

    const { password: passwd, id, ...userData } = user;

    const refreshSecret =
      process.env.JWT_REFRESH_SECRET ??
      process.env.JWT_SECRET ??
      "default_refresh_secret_key_12345";

    const refreshToken = this.jwtService.sign(
      { id: user.id },
      { expiresIn: "30d", secret: refreshSecret },
    );

    res.cookie("refreshtoken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    return {
      user: userData,
      token: this.jwtService.sign(
        { id: user.id },
        { expiresIn: "1h", secret: process.env.JWT_SECRET },
      ),
    };
  }

  async refresh(req: Request, res: Response) {
    try {
      const refreshtoken = req.cookies?.refreshtoken;

      if (!refreshtoken)
        throw new UnauthorizedException({
          message: "No refresh token provided",
          code: "no_refresh_token",
        });

      const refreshSecret =
        process.env.JWT_REFRESH_SECRET ??
        process.env.JWT_SECRET ??
        "default_refresh_secret_key_12345";

      const payload = this.jwtService.verify(refreshtoken, {
        secret: refreshSecret,
      });

      const user = await this.prismaService.user.findUnique({
        where: { id: payload.id },
      });

      if (!user)
        throw new NotFoundException({
          message: "User not found",
          code: "user_not_found",
        });

      const { password: passwd, id, ...userData } = user;

      return {
        user: userData,
        token: this.jwtService.sign(
          { id: user.id },
          { secret: process.env.JWT_SECRET, expiresIn: "1h" },
        ),
      };
    } catch (err) {
      this.logout(res);
      throw new UnauthorizedException({
        message: "Invalid refresh token",
        code: "invalid_refresh_token",
      });
    }
  }

  async logout(res: Response) {
    res.clearCookie("refreshtoken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
    });
  }
}
