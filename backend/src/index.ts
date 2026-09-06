import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';

import 'dotenv/config';

import type { Room } from './types/room';

import roomRouter from './routes/room.routes';
import authRouter from './routes/auth.routes';

const app = express();

const PORT = process.env.PORT || 8000;
const FRONTEND_BASE_URL = process.env.FRONTEND_BASE_URL;
const COOKIE_SECRET = process.env.COOKIE_SECRET;

export const rooms: Record<string, Room> = {};

app.use(cors({
  origin: FRONTEND_BASE_URL,
  allowedHeaders: ['Content-Type', 'X-Player-Id'],
  credentials: true
}));

app.use(express.json());
app.use(cookieParser(COOKIE_SECRET));

app.use('/room', roomRouter);
app.use('/auth', authRouter);

app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}.`);
});