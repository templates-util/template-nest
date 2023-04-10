import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { AwsModule } from './aws/aws.module';
import { AppRedisModule } from './cache/redis.module';
import { DatabaseModule } from './database.module';
import { QueueModule } from './fila/queue.module';
import { HealthModule } from './health/health.module';
import { PrometheusModule } from './monitoring/prometheus.module';
import { UserModule } from './user/user.module';
import { WinstonLogger } from './winston-logger.service';

@Module({
  imports: [
    DatabaseModule,
    UserModule,
    ConfigModule.forRoot({ isGlobal: true }),
    AuthModule,
    AwsModule,
    PrometheusModule,
    QueueModule,
    HealthModule,
    AppRedisModule,
  ],
  controllers: [AppController],
  providers: [AppService, WinstonLogger],
})
export class AppModule {}
