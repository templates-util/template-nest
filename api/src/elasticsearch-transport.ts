import { Client } from '@elastic/elasticsearch';
import { LogEntry } from 'winston';
import Transport from 'winston-transport';

interface ElasticsearchTransportOptions {
  node: string;
}

class ElasticsearchTransport extends Transport {
  private readonly client: Client;

  constructor(options: ElasticsearchTransportOptions) {
    super();

    this.client = new Client({
      node: options.node,
    });
  }

  async log(info: LogEntry, callback: () => void): Promise<void> {
    const { level, message, ...meta } = info;

    await this.client.index({
      index: `nestjs-logs-${new Date().toISOString().slice(0, 10)}`,
      body: {
        timestamp: new Date().toISOString(),
        level,
        message,
        meta,
      },
    });

    callback();
  }
}

export default ElasticsearchTransport;
