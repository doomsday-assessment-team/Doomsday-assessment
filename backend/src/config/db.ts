import pgPromise from 'pg-promise';
import * as dotenv from 'dotenv';
import { configureEnvironment } from '../utils/env';

const environmentVariables = configureEnvironment();

const pgp = pgPromise();

const db = pgp({
  host: environmentVariables.DB_HOST,
  port: parseInt(environmentVariables.DB_PORT || '5432'),
  database: environmentVariables.DB_NAME,
  user: environmentVariables.DB_USER,
  password: environmentVariables.DB_PASSWORD,
  ssl: { rejectUnauthorized: false }
});

export default db;
