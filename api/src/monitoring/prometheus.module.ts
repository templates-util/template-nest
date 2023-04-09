import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { PrometheusController } from './prometheus.controller';
import { PrometheusMiddleware } from './prometheus.middleware';
import { PrometheusService } from './prometheus.service';

@Module({ controllers: [PrometheusController], providers: [PrometheusService] })
export class PrometheusModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(PrometheusMiddleware).forRoutes('*');
  }
}
