// src/aws/aws.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Arquivo } from '../models/arquivo.entity';
import { AwsController } from './aws.controller';
import { S3Service } from './s3.service';

@Module({
  imports: [TypeOrmModule.forFeature([Arquivo]), ConfigModule],
  controllers: [AwsController],
  providers: [S3Service],
  exports: [S3Service],
})
export class AwsModule {}
