import { Request, Response, NextFunction } from 'express';
import * as userService from '../services/user.service';
import { ApiResponse } from '../types/api-response';
import { validateRequestBody } from '../utils/validate';

export const getAllUsers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const users = await userService.getAllUsers();
    const response: ApiResponse<typeof users> = { data: users };
    res.json(response);
  } catch (error) {
    next(error);
  }
};

export const createUser = async (req: Request, res: Response, next: NextFunction) => {
  const requiredFields = ['name', 'email', 'password'];
  
  if (validateRequestBody(requiredFields, req.body, res)) {
    try {
        const newUser = await userService.createUser(req.body);
        const response: ApiResponse<typeof newUser> = { data: newUser };
        res.status(201).json(response);
      } catch (error) {
        next(error);
    }
  } else {
    // If validation fails, the response is already sent in validateRequestBody
  }
};

