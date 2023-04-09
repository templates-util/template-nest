import * as dotenv from 'dotenv';
import { DataSource } from 'typeorm';
import { User } from './models/user.entity';
dotenv.config();

export const dataSource = new DataSource({
  type: 'postgres',
  host: process.env.TYPEORM_HOST,
  port: parseInt(process.env.TYPEORM_PORT),
  username: process.env.TYPEORM_USERNAME,
  password: process.env.TYPEORM_PASSWORD,
  database: process.env.TYPEORM_DATABASE,
  entities: [User],
  migrations: [],
});
