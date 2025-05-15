import express from 'express';
import cors from 'cors';
import path from 'path';

import adminRoutes from './routes/admin.routes';
import { errorHandler } from './middlewares/error.middleware';
import { authenticateJWT } from './middlewares/auth.middleware';
import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import quizRoutes from './routes/quiz.routes';
import scenarioRoutes from './routes/scenario.routes'
import difficultyRoutes from './routes/difficulty.routes'

const app = express();

app.use(cors());
app.use(express.json());

const publicPath = path.join(__dirname, '../../frontend/public');
app.use(express.static(publicPath));

app.get('/health', (req, res) => {

  res.status(200).send('OK');

});

app.use(authenticateJWT);

// our protected routes
app.use('/auth', authRoutes);
app.use('/admin', adminRoutes);
app.use('/users', userRoutes);
app.use('/quiz', quizRoutes);
app.use('', scenarioRoutes);
app.use('', difficultyRoutes);

app.use(errorHandler);

export default app;

