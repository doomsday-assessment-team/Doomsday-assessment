import express from 'express';
import cors from 'cors';
import path from 'path';

import adminRoutes from './routes/admin.routes';
import { errorHandler } from './middlewares/error.middleware';
import { authenticateJWT } from './middlewares/auth.middleware';
import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import quizRoutes from './routes/quiz.route';

const app = express();

app.use(cors());
app.use(express.json());
app.use(authenticateJWT);

app.use('/auth', authRoutes);
app.use('/admin', adminRoutes);
app.use('/api/users', userRoutes);

const publicPath = path.join(__dirname, '../../frontend/public');
app.use(express.static(publicPath));
app.get('/health', (req, res) => {

  res.status(200).send('OK');

});

app.use('/quiz', quizRoutes);

app.use(errorHandler);

export default app;

