import { Pool } from 'pg';
import { configureEnvironment } from '../utils/env';

const environmentVariables = configureEnvironment();

export const DBPool = new Pool({
    connectionString: process.env.DB_CONNECTION_STRING,
    host: environmentVariables.DB_HOST,
    port: parseInt(environmentVariables.DB_PORT || '5432'),
    database: environmentVariables.DB_NAME,
    user: environmentVariables.DB_USER,
    password: environmentVariables.DB_PASSWORD,
    // ssl: { rejectUnauthorized: false } //used for RDS instance
});