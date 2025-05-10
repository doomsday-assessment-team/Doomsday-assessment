import { Request, Response, NextFunction } from 'express';
import { DatabaseError } from 'pg-protocol';
import { ErrorResponse } from '../types/error-response';
import { configureEnvironment, EnvironmentVariables, environmentTypes } from '../utils/env';

const environmentVariables: EnvironmentVariables = configureEnvironment();

export const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
  let statusCode: number;
  let errorResponse: ErrorResponse;
  if (isDuplicateKeyError(err)) {
    statusCode = 409;
    errorResponse = {
      error: 'Conflict',
      message: 'Duplicate key violation - resource already exists'
    };
  } else {
    statusCode = 500;
    errorResponse = {
      error: 'Internal Server Error',
      message: err.message 
    };
  }

  res.status(statusCode).json(errorResponse);

  if (environmentVariables.NODE_ENV == environmentTypes.DEVELOPMENT) {
    console.error(err);
  } else {
    // IN production or testing
  }
};

function isDuplicateKeyError(err: unknown): boolean {
  const isError = err instanceof Error;
  const isPgError = isError && 'code' in err;
  const isDuplicateKey = isPgError && (err as DatabaseError).code === '23505';
  return isDuplicateKey;
}