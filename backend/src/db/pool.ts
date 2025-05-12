import { Pool } from 'pg';

export const DBPool = new Pool({
<<<<<<< Updated upstream
    connectionString: process.env.DB_CONNECTION_STRING,
    // ssl: {
    //     rejectUnauthorized: false
    // }
=======
    host: environmentVariables.DB_HOST,
    port: parseInt(environmentVariables.DB_PORT || '5432'),
    database: environmentVariables.DB_NAME,
    user: environmentVariables.DB_USER,
    password: environmentVariables.DB_PASSWORD,
    //ssl: { rejectUnauthorized: false } //will be used for RDS instance
>>>>>>> Stashed changes
});