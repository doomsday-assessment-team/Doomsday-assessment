import express from 'express';
import cors from 'cors';
import path from 'path';

import userRoutes from './routes/user.routes';
import { errorHandler } from './middlewares/error.middleware';

const app = express();

app.use(cors());
app.use(express.json());

import authRoutes from './routes/auth.routes';
app.use('/auth', authRoutes);

// Serve frontend static files
const publicPath = path.join(__dirname, '../../frontend/public');
app.use(express.static(publicPath));

// Routes
app.use('/api/users', userRoutes);

// Global error handler
app.use(errorHandler);

export default app;

