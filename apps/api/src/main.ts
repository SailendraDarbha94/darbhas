import "reflect-metadata";
import { ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const siteDomain = process.env.SITE_DOMAIN ?? "darbha.info";
  const extraOrigins = (process.env.CORS_ORIGINS ?? "")
    .split(",")
    .map((o) => o.trim())
    .filter(Boolean);

  app.enableCors({
    origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
      if (!origin) return callback(null, true);
      const allowed =
        extraOrigins.includes(origin) ||
        new RegExp(`^https://([a-z0-9-]+\\.)?${siteDomain.replace(/\./g, "\\.")}$`).test(origin) ||
        /^http:\/\/([a-z0-9-]+\.)?localhost:\d+$/.test(origin);
      callback(null, allowed);
    },
    credentials: true,
  });

  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  app.setGlobalPrefix("v1");

  await app.listen(process.env.PORT ?? 4400);
}

bootstrap();
