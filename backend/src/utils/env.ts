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

const getEnvVar = (key: string, defaultValue?: string): string => {

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

  const value = process.env[key] ?? defaultValue;

  for (const [varName, { validate, error }] of Object.entries(requiredVariables)) {
    if (value === undefined || value === '') {
      throw new Error(`FATAL ERROR: Environment variable ${key} is not set.`);
    } else if (varName === key && !validate(value)) {
      throw new Error(`FATAL ERROR: ${key} ${error}`);
    }
  }

  return value!;
};

export let environmentTypes = {
  DEVELOPMENT: 'development',
  PRODUCTION: 'production'
}

let cachedEnv: EnvironmentVariables | undefined = undefined;

export function configureEnvironment(): EnvironmentVariables {
  if (cachedEnv) {
    return cachedEnv;
  } else {
    try {

      const isDevelopmentMode = process.env.NODE_ENV === 'development' || process.env.NODE_ENV === undefined;
      const result = dotenv.config();

      if (isDevelopmentMode) {
        if (result.error) {
          throw new Error(`Failed to load environment file: ${result.error.message}`);
        } else if (!result.parsed) {
          throw new Error(`Environment file ( is empty`);
        }
      }

      const parsedEnv = validateAndTransformEnv();
      cachedEnv = parsedEnv;
      return parsedEnv;

    } catch (error) {
      console.error('Environment configuration failed:', error);
      throw error;
    }
  }

}

function validateAndTransformEnv(): EnvironmentVariables {
  return {
    NODE_ENV: process.env.NODE_ENV as 'development' | 'production',
    PORT: getEnvVar("PORT", "3000"),
    DB_HOST: getEnvVar("DB_HOST"),
    DB_PORT: getEnvVar("DB_PORT"),
    DB_USER: getEnvVar("DB_USER"),
    DB_PASSWORD: getEnvVar("DB_PASSWORD"),
    DB_NAME: getEnvVar("DB_NAME"),
    GOOGLE_CLIENT_ID: getEnvVar("GOOGLE_CLIENT_ID"),
    GOOGLE_CLIENT_SECRET: getEnvVar("GOOGLE_CLIENT_SECRET"),
    GOOGLE_REDIRECT_URI: getEnvVar("GOOGLE_REDIRECT_URI"),
    JWT_SECRET: getEnvVar("JWT_SECRET"),
    FRONTEND_URL: getEnvVar("FRONTEND_URL")
  };
}