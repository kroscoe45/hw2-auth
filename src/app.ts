import express from 'express';
import { accountsRouter } from './routes/accounts';

const app = express();
app.use('/accounts', accountsRouter);
