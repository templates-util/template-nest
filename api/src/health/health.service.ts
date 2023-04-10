import { RedisService } from '@liaoliaots/nestjs-redis';
import { Injectable } from '@nestjs/common';
import { HealthIndicatorResult } from '@nestjs/terminus';
import { S3Service } from '../aws/s3.service';

@Injectable()
export class HealthService {
  constructor(
    private readonly redisService: RedisService,
    private readonly s3Service: S3Service,
  ) {}

  async redisCheck(): Promise<HealthIndicatorResult> {
    const client = this.redisService.getClient();
    const isHealthy = await client.ping();
    const result: HealthIndicatorResult = {
      redis: {
        status: isHealthy ? 'up' : 'down',
      },
    };

    return result;
  }

  async s3Check(): Promise<HealthIndicatorResult> {
    try {
      const response = await this.s3Service.listBuckets();
      const result: HealthIndicatorResult = {
        s3: {
          status: response.Buckets ? 'up' : 'down',
        },
      };
      return result;
    } catch (error) {
      return {
        s3: {
          status: 'down',
          error: error.message,
        },
      };
    }
  }
}
