import { Request, Response, NextFunction } from 'express';
import { DatabaseError } from 'pg-protocol';
import { ErrorResponse } from '../types/error-response';
import { configureEnvironment, EnvironmentVariables, environmentTypes } from '../utils/env';
import { ServiceError } from '../services/quiz.service';

const environmentVariables: EnvironmentVariables = configureEnvironment();

export const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
  
  let statusCode: number = 500;
  let errorResponse: ErrorResponse = {
    error: 'Internal Server Error',
    message: 'Internal Server Error'
  };

  console.error(`[ERROR] ${new Date().toISOString()} - ${req.method} ${req.originalUrl}`);
  console.error('Stack:', err.stack || 'No stack trace available');
  
  if (isDuplicateKeyError(err)) {
    statusCode = 409;
    errorResponse = {
      error: 'Conflict',
      message: 'Duplicate key violation - resource already exists'
    };
  }
  
  if (err instanceof DatabaseError) { 
    switch (err.code) {
      case '23502':
        statusCode = 400;
        errorResponse = {
          error: 'Bad request',
          message: `Missing required field: ${err.column || 'Unknown'}.`
        }
        
        break;
      case '23503':
        statusCode = 404;
        errorResponse = {
          error: 'Resource not found',
          message: `Invalid reference: ${err.constraint || 'A related record does not exist'}.`
        }
        break;
      case '23505':
        statusCode = 409; 
        errorResponse = {
          error: 'Conflict',
          message: `Conflict: ${err.constraint || 'A record with this value already exists'}.`
        }
        break;
      case '22P02':
        statusCode = 400;
        errorResponse = {
          error: 'Bad request',
          message: `Invalid data format for a field.`
        }
        break;
    }
  } else if (err instanceof ServiceError) {
      statusCode = err.statusCode;
      errorResponse = {
        error: 'Bad request',
        message: err.message
      }
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