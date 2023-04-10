import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import {
  HealthCheck,
  HealthCheckService,
  TypeOrmHealthIndicator,
} from '@nestjs/terminus';
import { JwtAuthGuard } from '../auth/auth.guard';
import { HealthService } from './health.service';

@UseGuards(JwtAuthGuard)
@ApiTags('health')
@Controller('health')
export class HealthController {
  constructor(
    private healthCheckService: HealthCheckService,
    private typeOrmHealthIndicator: TypeOrmHealthIndicator,
    private healthService: HealthService,
  ) {}

  @Get()
  @HealthCheck()
  @ApiResponse({
    status: 200,
    description:
      'Health check endpoint with database status, Redis status, and S3 status',
  })
  async check() {
    return this.healthCheckService.check([
      async () => this.typeOrmHealthIndicator.pingCheck('database'),
      async () => this.healthService.redisCheck(),
      async () => this.healthService.s3Check(),
    ]);
  }
}
