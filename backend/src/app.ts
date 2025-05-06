import express from 'express';
import cors from 'cors';
import userRoutes from './routes/user.routes';
import { errorHandler } from './middlewares/error.middleware';

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/users', userRoutes);

app.get('/health', (req, res) => {

  res.status(200).send('OK');

});

app.use(errorHandler);

export default app;
