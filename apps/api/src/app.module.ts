import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { APP_FILTER, APP_GUARD } from "@nestjs/core";
import { ThrottlerGuard, ThrottlerModule } from "@nestjs/throttler";
import { LoggerModule } from "nestjs-pino";
import { AllExceptionsFilter } from "./common/filters/all-exceptions.filter";
import { validateEnv, type Env } from "./config/env";
import { HealthModule } from "./health/health.module";
import { PrismaModule } from "./prisma/prisma.module";
import { WorksModule } from "./modules/works/works.module";
import { ChaptersModule } from "./modules/chapters/chapters.module";
import { AuthModule } from "./modules/auth/auth.module";
import { AccountModule } from "./modules/account/account.module";
import { AuditModule } from "./modules/audit/audit.module";
import { EmailModule } from "./modules/email/email.module";
import { ScripturesModule } from "./modules/scriptures/scriptures.module";
import { VersesModule } from "./modules/verses/verses.module";
import { SearchModule } from "./modules/search/search.module";
import { MediaModule } from "./modules/media/media.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      validate: validateEnv,
    }),

    ThrottlerModule.forRoot([
      {
        name: "default",
        ttl: 60_000,
        limit: 120,
      },
    ]),

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
    EmailModule,
    AuditModule,
    HealthModule,
    AuthModule,
    AccountModule,
    WorksModule,
    ChaptersModule,
    ScripturesModule,
    VersesModule,
    SearchModule,
    MediaModule,
  ],
  providers: [
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
