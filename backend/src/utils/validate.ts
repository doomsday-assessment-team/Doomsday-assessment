import { Request, Response } from 'express';
import { ApiResponse } from '../types/api-response';

export const validateRequestBody = (
  requiredFields: string[],
  body: any,
  res: Response
): boolean => {
  const missingFields = requiredFields.filter((field) => !(field in body));

  if (missingFields.length > 0) {
    const response: ApiResponse<null> = { message: `Missing required fields: ${missingFields.join(', ')}` };
    res.status(400).json(response);
    return false;
  }

  return true;
};
