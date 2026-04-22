import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { ValidationPipe } from "@nestjs/common";
import cookieParser from "cookie-parser";
import "dotenv/config";

console.log("[main.ts] Starting...");

async function bootstrap() {
  console.log("[main.ts] Creating NestFactory...");
  const app = await NestFactory.create(AppModule);
  console.log("[main.ts] NestFactory created");

  app.use(cookieParser());

  app.enableCors({
    origin: true,
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: false,
      transform: true,
    }),
  );

  const port = process.env.PORT ?? 3000;
  const host = process.env.HOST ?? "0.0.0.0";
  console.log("[main.ts] Listening on", `${host}:${port}`);
  await app.listen(port, host);
  console.log("[main.ts] Server started on", `${host}:${port}`);
}

bootstrap().catch(console.error);
