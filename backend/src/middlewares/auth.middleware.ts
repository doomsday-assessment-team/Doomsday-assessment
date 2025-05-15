import { Request, Response, NextFunction } from 'express';
import { JwtPayload } from '../types/auth';
import jwt from 'jsonwebtoken';

export function authenticateJWT(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;

  if (req.path === '/' || req.path === '/health' || req.path === '/auth/google' || req.path === '/auth/google/callback') {
    next();
    return;
  }

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.error('Missing or invalid Authorization header');
    res.status(401).json({ message: 'Missing or invalid Authorization header' });

    return;
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
    console.error('Token missing after Bearer prefix');
    res.status(401).json({ message: 'Token missing after Bearer prefix' });
    return;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
    req.user = decoded;
    next();
  } catch (err) {
    console.error(err);
    res.status(401).json({ message: 'Invalid token' });
  }
}

export function checkAdminRole(req: Request, res: Response, next: NextFunction): void {
  const roles = req.user?.roles;

  if (!roles || !Array.isArray(roles) || !roles.includes('admin')) {
    res.status(403).json({ message: 'Access denied: Admin role required' });
    return;
  }

  next();
}
