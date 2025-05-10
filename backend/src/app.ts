import express from 'express';
import cors from 'cors';
import path from 'path';

import adminRoutes from './routes/admin.routes';
import { errorHandler } from './middlewares/error.middleware';
import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';

const app = express();

app.use(cors());
app.use(express.json());

app.use('/auth', authRoutes);
app.use('/admin', adminRoutes);

const publicPath = path.join(__dirname, '../../frontend/public');
app.use(express.static(publicPath));

app.use('/api/users', userRoutes);
app.get('/health', (req, res) => {

  res.status(200).send('OK');

});

app.use(errorHandler);

export default app;

