import express from 'express';
import cors from 'cors';
import path from 'path';

import userRoutes from './routes/user.routes';
import { errorHandler } from './middlewares/error.middleware';
import { authenticateJWT } from './middlewares/auth.middleware';
import authRoutes from './routes/auth.routes';

const app = express();

app.use(cors());
app.use(express.json());
app.use(authenticateJWT);

app.use('/auth', authRoutes);

const publicPath = path.join(__dirname, '../../frontend/public');
app.use(express.static(publicPath));

app.use('/api/users', userRoutes);

app.get('/health', (req, res) => {

  res.status(200).send('OK');

});

app.use(errorHandler);

export default app;

