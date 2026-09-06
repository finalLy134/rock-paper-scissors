import express from 'express';
import cors from 'cors';

import type { Room } from './types/room';
import roomRouter from './routes/room.routes';

const app = express();
const PORT = process.env.PORT || 8000;

export const rooms: Record<string, Room> = {};

app.use(cors());
app.use(express.json());

app.use('/', roomRouter);

app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}.`);
});