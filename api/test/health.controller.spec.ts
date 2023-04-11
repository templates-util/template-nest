import { ConfigModule, ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule, getRepositoryToken } from '@nestjs/typeorm';
import * as dotenv from 'dotenv';
import { Repository } from 'typeorm';
import { AwsModule } from '../src/aws/aws.module';
import { S3Service } from '../src/aws/s3.service';
import { HealthController } from '../src/health/health.controller';
import { HealthModule } from '../src/health/health.module';
import { HealthService } from '../src/health/health.service';
import { Arquivo } from '../src/models/arquivo.entity';
import { User } from '../src/models/user.entity';
dotenv.config();

describe('HealthController', () => {
  let controller: HealthController;
  let service: HealthService;
  let s3Service: S3Service;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        HealthModule,
        AwsModule,
        ConfigModule.forRoot(),
        TypeOrmModule.forRoot({
          type: (process.env.TYPEORM_CONNECTION as any) || 'postgres',
          host: process.env.TYPEORM_HOST,
          port: 5432,
          username: process.env.TYPEORM_USERNAME,
          password: process.env.TYPEORM_PASSWORD,
          database: process.env.TYPEORM_DATABASE,
          synchronize: process.env.TYPEORM_SYNCHRONIZE === 'true',
          logging: process.env.TYPEORM_LOGGING === 'true',
          entities: [Arquivo, User],
        }),
      ],
      providers: [
        ConfigService,
        {
          provide: getRepositoryToken(Arquivo),
          useClass: Repository,
        },
      ],
    }).compile();

    controller = module.get<HealthController>(HealthController);
    service = module.get<HealthService>(HealthService);
    s3Service = module.get<S3Service>(S3Service);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('check', () => {
    it('should return health check results', async () => {
      const expectedResult = {
        status: 'ok',
        info: {
          database: { status: 'up' },
          redis: { status: 'up' },
          s3: { status: 'up' },
        },
        error: {},
        details: {
          database: { status: 'up' },
          redis: { status: 'up' },
          s3: { status: 'up' },
        },
      };

      jest
        .spyOn(service, 'redisCheck')
        .mockResolvedValueOnce({ redis: { status: 'up' } });

      jest
        .spyOn(service, 's3Check')
        .mockResolvedValueOnce({ s3: { status: 'up' } });

      const result = await controller.check();
      expect(result).toEqual(expectedResult);
    });
  });
});
