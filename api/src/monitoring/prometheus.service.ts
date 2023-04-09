import { Injectable } from '@nestjs/common';
import { Counter, Histogram, Registry } from 'prom-client';

@Injectable()
export class PrometheusService {
  private readonly httpRequestsTotal: Counter<string>;
  private readonly registry: Registry;
  private readonly httpRequestDurationSeconds: Histogram<string>;

  constructor() {
    this.registry = new Registry();

    this.httpRequestsTotal = new Counter({
      name: 'http_requests_total',
      help: 'Total number of HTTP requests',
      labelNames: ['method', 'statusCode'],
      registers: [this.registry],
    });

    this.httpRequestDurationSeconds = new Histogram({
      name: 'http_request_duration_seconds',
      help: 'HTTP request duration in seconds',
      labelNames: ['method', 'statusCode'],
      buckets: [0.1, 0.5, 1, 2, 5],
      registers: [this.registry],
    });
  }

  public increaseHttpRequestsTotal(method: string, statusCode: number) {
    this.httpRequestsTotal.inc({ method, statusCode });
  }

  public observeHttpRequestDurationSeconds(
    method: string,
    statusCode: number,
    duration: number,
  ) {
    this.httpRequestDurationSeconds.observe({ method, statusCode }, duration);
  }

  public async getMetrics(): Promise<string> {
    return this.registry.metrics();
  }
}
