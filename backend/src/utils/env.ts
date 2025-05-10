import dotenv from 'dotenv';
import path from 'path';

export interface EnvironmentVariables {
  NODE_ENV: 'development' | 'production';
  PORT: string;
  DB_HOST: string;
  DB_PORT: string;
  DB_USER: string;
  DB_PASSWORD: string;
  DB_NAME: string;
  GOOGLE_CLIENT_ID: string;
  GOOGLE_CLIENT_SECRET: string;
  GOOGLE_REDIRECT_URI: string;
  JWT_SECRET: string;
  FRONTEND_URL: string;
}

export let environmentTypes = {
    DEVELOPMENT: 'development',
    PRODUCTION: 'production'
}

let cachedEnv: EnvironmentVariables | undefined = undefined;

export function configureEnvironment(): EnvironmentVariables {
  if (cachedEnv){
    return cachedEnv;
  } else {
    try {
        const envFile = getEnvFileName();
        const envPath = path.resolve(process.cwd(), envFile);
        const result = dotenv.config({ path: envPath });

        if (result.error) {
            throw new Error(`Failed to load environment file (${envPath}): ${result.error.message}`);
        } else if (!result.parsed) {
            throw new Error(`Environment file (${envPath}) is empty`);
        } else {
            console.log(`Environment variables loaded from: ${envPath}`);
            const parsedEnv = validateAndTransformEnv(result.parsed);
            console.log(parsedEnv);
            cachedEnv = parsedEnv;
            return parsedEnv;
        }
    } catch (error) {
        console.error('Environment configuration failed:', error);
        throw error;
    }
  }

}

function getEnvFileName(): string {
  const env = process.env.NODE_ENV;
  
  const envFiles = {
    production: '.env.production',
    development: '.env.development',
  };

  return envFiles[env as keyof typeof envFiles] || '.env';
}

function validateAndTransformEnv(env: dotenv.DotenvParseOutput): EnvironmentVariables {
  const requiredVariables = {
    PORT: {
      validate: (value: string) => !isNaN(Number(value)),
      error: "must be a number"
    },
    DB_HOST: {
      validate: (value: string) => value.length > 0,
      error: "cannot be empty"
    },
    DB_PORT: {
      validate: (value: string) => !isNaN(Number(value)),
      error: "must be a number"
    },
    DB_USER: {
      validate: (value: string) => value.length > 0,
      error: "cannot be empty"
    },
    DB_PASSWORD: {
      validate: (value: string) => value.length > 0,
      error: "cannot be empty"
    },
    DB_NAME: {
      validate: (value: string) => value.length > 0,
      error: "cannot be empty"
    },
    GOOGLE_CLIENT_ID: {
      validate: (value: string) => value.length > 0,
      error: "cannot be empty"
    },
    GOOGLE_CLIENT_SECRET: {
      validate: (value: string) => value.length > 0,
      error: "cannot be empty"
    },
    GOOGLE_REDIRECT_URI: {
      validate: (value: string) => value.length > 0 && value.startsWith('http'),
      error: "must be a valid URL"
    },
    JWT_SECRET: {
      validate: (value: string) => value.length >= 32,
      error: "must be at least 32 characters"
    },
    FRONTEND_URL: {
      validate: (value: string) => value.length > 0 && value.startsWith('http'),
      error: "must be a valid URL"
    }
  };

  const missingVariables: string[] = [];
  const invalidVariables: Record<string, string> = {};

  for (const [varName, { validate, error }] of Object.entries(requiredVariables)) {
    const value = env[varName];
    
    if (value === undefined || value === '') {
      missingVariables.push(varName);
    } else if (!validate(value)) {
      invalidVariables[varName] = error;
    }
  }

  if (missingVariables.length > 0 || Object.keys(invalidVariables).length > 0) {
    const errorMessages = [];
    if (missingVariables.length > 0) {
      errorMessages.push(`Missing: ${missingVariables.join(', ')}`);
    }
    if (Object.keys(invalidVariables).length > 0) {
      errorMessages.push(`Invalid: ${Object.entries(invalidVariables)
        .map(([name, error]) => `${name} (${error})`)
        .join(', ')}`);
    }
    throw new Error(`Environment validation failed:\n${errorMessages.join('\n')}`);
  }

  return {
    NODE_ENV: process.env.NODE_ENV as 'development' | 'production',
    PORT: env.PORT,
    DB_HOST: env.DB_HOST,
    DB_PORT: env.DB_PORT,
    DB_USER: env.DB_USER,
    DB_PASSWORD: env.DB_PASSWORD,
    DB_NAME: env.DB_NAME,
    GOOGLE_CLIENT_ID: env.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET: env.GOOGLE_CLIENT_SECRET,
    GOOGLE_REDIRECT_URI: env.GOOGLE_REDIRECT_URI,
    JWT_SECRET: env.JWT_SECRET,
    FRONTEND_URL: env.FRONTEND_URL
  };
}