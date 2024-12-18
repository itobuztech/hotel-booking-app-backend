import { join } from "path";
import * as dotenv from "dotenv";
import { Module } from "@nestjs/common";
import { APP_GUARD, APP_INTERCEPTOR, RouterModule } from "@nestjs/core";
import { GraphQLModule } from "@nestjs/graphql";
import { ApolloDriver, ApolloDriverConfig } from "@nestjs/apollo";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { ThrottlerModule } from "@nestjs/throttler";
import {
  GraphqlInterceptor,
  SentryModule,
} from "@travelerdev/nestjs-sentry-graphql";
import { UsersModule } from "./users/users.module";
import { AuthModule } from "./auth/auth.module";
import { AccountModule } from "./account/account.module";
import { LoggerModule } from "./logger/app-logger.module";
import { GqlThrottlerGuard } from "./util/guards/gql-execution-context.guard";
import throttle from "./config/throttle.config";
import { UploadModule } from "./upload/upload.module";
import { ItemModule } from "./item/item.module";

const env = `${(process.env.NODE_ENV || "development").toLowerCase()}`;

dotenv.config({ path: join(process.cwd(), `.env.${env}`) });
@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: join(process.cwd(), `.env.${env}`),
      isGlobal: true,
      load: [throttle],
    }),
    GraphQLModule.forRoot({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), "src/schema.gql"),
      formatError: (error) => {
        const graphQLFormattedError = {
          message:
            error.extensions?.exception?.response?.message || error.message,
          code: error.extensions?.code || "SERVER_ERROR",
          status: error.extensions?.status || error.status,
        };
        return graphQLFormattedError;
      },
      sortSchema: true,
      csrfPrevention: false, // Enables CSRF protection
      cache: "bounded",
      uploads: false, // Disable built-in upload handling
    }),
    RouterModule.register([
      {
        path: "upload",
        module: UploadModule,
      },
    ]),
    UploadModule,
    UsersModule,
    AuthModule,
    AccountModule,
    LoggerModule,
    ItemModule,
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => [
        {
          ttl: config.get("throttle.TTL"),
          limit: config.get("throttle.LIMIT"),
        },
      ],
    }),
    SentryModule.forRoot({
      dsn: process.env.SENTRY_DSN,
      debug: true,
      environment: process.env.APP_ENV,
      logLevels: ["debug"],
    }),
  ],
  controllers: [],
  providers: [
    {
      provide: APP_GUARD,
      useClass: GqlThrottlerGuard,
    },
    {
      provide: APP_INTERCEPTOR,
      useFactory: () => new GraphqlInterceptor(),
    },
  ],
})
export class AppModule {}
