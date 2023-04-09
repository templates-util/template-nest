import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response } from 'express';
import { PrometheusService } from './prometheus.service';

@Injectable()
export class PrometheusMiddleware implements NestMiddleware {
  constructor(private readonly prometheusService: PrometheusService) {}

  use(req: Request, res: Response, next: () => void) {
    const startTime = Date.now();

    res.on('finish', () => {
      const duration = Date.now() - startTime;
      const statusCode = res.statusCode;
      const method = req.method;

      this.prometheusService.increaseHttpRequestsTotal(method, statusCode);
      this.prometheusService.observeHttpRequestDurationSeconds(
        method,
        statusCode,
        duration,
      );
    });

    next();
  }
}
