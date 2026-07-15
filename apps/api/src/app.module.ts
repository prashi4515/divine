import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { APP_FILTER } from "@nestjs/core";
import { LoggerModule } from "nestjs-pino";
import { AllExceptionsFilter } from "./common/filters/all-exceptions.filter";
import { validateEnv, type Env } from "./config/env";
import { HealthModule } from "./health/health.module";
import { PrismaModule } from "./prisma/prisma.module";
import { WorksModule } from "./modules/works/works.module";
import { ChaptersModule } from "./modules/chapters/chapters.module";
import { AuthModule } from "./modules/auth/auth.module";
import { ScripturesModule } from "./modules/scriptures/scriptures.module";
import { VersesModule } from "./modules/verses/verses.module";
import { SearchModule } from "./modules/search/search.module";
import { MediaModule } from "./modules/media/media.module";

@Module({
  imports: [
    // Global env config, validated once at boot with Zod.
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      validate: validateEnv,
    }),

    // Structured JSON logging (pino). Pretty-printed in dev, raw JSON in prod
    // so log drains / aggregators can parse it. Redacts auth headers.
    LoggerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService<Env, true>) => ({
        pinoHttp: {
          level: config.get("DIVINE_LOG_LEVEL", { infer: true }),
          redact: ["req.headers.authorization", "req.headers.cookie"],
          transport:
            config.get("NODE_ENV", { infer: true }) === "production"
              ? undefined
              : { target: "pino-pretty", options: { singleLine: true } },
        },
      }),
    }),

    PrismaModule,
    HealthModule,
    AuthModule,
    WorksModule,
    ChaptersModule,
    ScripturesModule,
    VersesModule,
    SearchModule,
    MediaModule,
  ],
  providers: [
    // Global catch-all exception filter (consistent error envelope + logging).
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
  ],
})
export class AppModule {}
