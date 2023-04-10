import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppRedisModule } from 'src/cache/redis.module';
import { AwsModule } from '../aws/aws.module';
import { HealthController } from './health.controller';
import { HealthService } from './health.service';

@Module({
  imports: [TerminusModule, TypeOrmModule, AppRedisModule, AwsModule],
  controllers: [HealthController],
  providers: [HealthService],
})
export class HealthModule {}
