import { Router } from 'express';
import generateRandomCode from '../utils/room';

import { rooms } from '../index';
import { getOrSetUserCookie } from '../utils/auth';

const roomRouter = Router();

roomRouter.post('/enter', (req, res) => {
    let { code } = req.body;
    let { userUuid, isNew } = getOrSetUserCookie(req, res);

    // If no code was provided or generated, make a random one
    if (!code || code.trim() === "") {
        do {
            code = generateRandomCode();
        } while (rooms[code] !== undefined);
    }

    // If the room doesn't exist, create it
    if (!rooms[code]) {
        rooms[code] = {
            code: code,
            hostId: userUuid,
            players: []
        };
        console.log(`Created room ${code}`)
        return res.json({ action: "created", success: true, code });
    }

    // If the room already exists, join it
    res.json({ action: "joined", success: true, code });
});

export default roomRouter;