import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { AwsModule } from './aws/aws.module';
import { DatabaseModule } from './database.module';
import { FileUploadService } from './file-upload.service';
import { PrometheusModule } from './monitoring/prometheus.module';
import { UserModule } from './user/user.module';
@Module({
  imports: [
    DatabaseModule,
    UserModule,
    ConfigModule.forRoot({ isGlobal: true }),
    AuthModule,
    AwsModule,
    PrometheusModule,
  ],
  controllers: [AppController],
  providers: [AppService, FileUploadService],
})
export class AppModule {}
