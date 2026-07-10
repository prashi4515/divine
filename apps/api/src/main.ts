import { ValidationPipe } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { NestFactory } from "@nestjs/core";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { Logger } from "nestjs-pino";
import { AppModule } from "./app.module";
import type { Env } from "./config/env";

async function bootstrap(): Promise<void> {
  // bufferLogs so early boot messages route through pino once it's ready.
  const app = await NestFactory.create(AppModule, { bufferLogs: true });

  // Replace Nest's default logger with pino for the whole app.
  app.useLogger(app.get(Logger));

  const config = app.get(ConfigService<Env, true>);

  // Graceful shutdown: triggers PrismaService.onModuleDestroy on SIGTERM/SIGINT.
  app.enableShutdownHooks();

  // CORS limited to the known web origin.
  app.enableCors({ origin: config.get("DIVINE_WEB_ORIGIN", { infer: true }), credentials: true });

  // Global input validation: strip unknown props, reject extras, auto-transform
  // payloads into their DTO types. This is the single validation policy.
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  // API lives under /v1. Do NOT also call enableVersioning() — combining both
  // creates legacy "/v1/*" wildcards that Nest 11 warns about.
  // Health stays outside the prefix for load balancers / Docker healthchecks.
  app.setGlobalPrefix("v1", { exclude: ["health"] });

  // OpenAPI / Swagger UI at /docs.
  const swaggerConfig = new DocumentBuilder()
    .setTitle("Divine API")
    .setDescription("Foundation API for the Divine platform.")
    .setVersion("0.0.1")
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup("docs", app, document);

  const port = config.get("DIVINE_API_PORT", { infer: true });
  await app.listen(port);

  app.get(Logger).log(`Divine API listening on http://localhost:${port} (docs at /docs)`);
}

void bootstrap();
