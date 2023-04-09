import { Controller, Get, Res } from '@nestjs/common';
import { Response } from 'express';
import { PrometheusService } from './prometheus.service';

@Controller('metrics')
export class PrometheusController {
  constructor(private readonly prometheusService: PrometheusService) {}

  @Get()
  async getMetrics(@Res() res: Response) {
    res.set('Content-Type', 'text/plain');
    res.end(await this.prometheusService.getMetrics());
  }
}
