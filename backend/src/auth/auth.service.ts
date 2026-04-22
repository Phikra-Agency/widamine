import { PrismaService } from "@/prisma/prisma.service";
import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { LoginDto } from "./dto/login.dto";
import { Request, Response } from "express";
import * as bcrypt from "bcrypt";

@Injectable()
export class AuthService {
  constructor(
    private prismaService: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async login(loginDto: LoginDto, res: Response) {
    const user = await this.prismaService.user.findUnique({
      where: { email: loginDto.email },
    });

    if (!user) throw new NotFoundException({ email: "email_not_found" });

    const valid = await bcrypt.compare(loginDto.password, user.password);
    if (!valid) throw new UnauthorizedException({ password: "wrong_password" });

    const { password: passwd, id, ...userData } = user;

    const refreshToken = this.jwtService.sign(
      { id: user.id },
      { expiresIn: "30d", secret: process.env.JWT_REFRESH_SECRET },
    );

    res.cookie("refreshtoken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/refresh",
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
        });

      const payload = this.jwtService.verify(refreshtoken, {
        secret: process.env.JWT_REFRESH_SECRET,
      });

      const user = await this.prismaService.user.findUnique({
        where: { id: payload.id },
      });

      if (!user) throw new NotFoundException("user_not_found");

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
      throw new UnauthorizedException("invalid_refresh_token");
    }
  }

  async logout(res: Response) {
    res.clearCookie("refreshtoken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/refresh",
    });
  }
}
