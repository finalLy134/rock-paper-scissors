import { Router } from 'express';
import generateRandomCode from '../utils/room';
import { rooms } from '../index';

const roomRouter = Router();

// Player identity now comes from a per-tab id the client generates and
// stores in sessionStorage, sent as the X-Player-Id header. This avoids
// the "two tabs in the same browser share one cookie" problem.
function getPlayerId(req: any, res: any): string | null {
    const playerId = req.header('x-player-id');
    if (!playerId || typeof playerId !== 'string') {
        res.status(400).json({ error: "Missing X-Player-Id header" });
        return null;
    }
    return playerId;
}

roomRouter.post('/enter', (req, res) => {
    let { code } = req.body;
    const userUuid = getPlayerId(req, res);
    if (!userUuid) return;

    if (!code || code.trim() === "") {
        do {
            code = generateRandomCode();
        } while (rooms[code] !== undefined);
    }

    if (!rooms[code]) {
        rooms[code] = {
            code,
            hostId: userUuid,
            joinerId: undefined,
            choices: {},
            status: 'waiting'
        };
        console.log(`Created room ${code}`);
        return res.json({ status: "created", code });
    }

    const room = rooms[code];

    if (room.hostId === userUuid) {
        return res.json({ status: room.status, code });
    }

    if (room.joinerId === userUuid) {
        return res.json({ status: room.status, code });
    }

    if (room.joinerId) {
        return res.status(403).json({ error: "Room is full" });
    }

    // First real joiner
    room.joinerId = userUuid;
    room.status = 'started';

    res.json({ status: "started", code });
});

roomRouter.get('/:code/status', (req: any, res) => {
    const { code } = req.params;
    const userUuid = getPlayerId(req, res);
    if (!userUuid) return;

    const room = rooms[code];
    if (!room) {
        return res.status(404).json({ error: "Room not found" });
    }

    const responsePayload: any = {
        status: room.status,
        joinerId: room.joinerId || null
    };

    if (room.status === "finished") {
        const playerIds = Object.keys(room.choices || {});
        if (playerIds.length === 2) {
            const [p1Id, p2Id] = playerIds;
            const p1Choice = room.choices[p1Id];
            const p2Choice = room.choices[p2Id];

            let winner = 'tie';
            if (p1Choice !== p2Choice) {
                winner =
                    (p1Choice === 'rock' && p2Choice === 'scissors') ||
                    (p1Choice === 'paper' && p2Choice === 'rock') ||
                    (p1Choice === 'scissors' && p2Choice === 'paper')
                        ? p1Id
                        : p2Id;
            }

            responsePayload.choices = room.choices;
            responsePayload.winner = winner;
            responsePayload.currentUserId = userUuid;
        }
    }

    res.json(responsePayload);
});

roomRouter.post('/:code/makeChoice', (req: any, res) => {
    const { code } = req.params;
    const { playerChoice } = req.body;
    const userUuid = getPlayerId(req, res);
    if (!userUuid) return;

    const room = rooms[code];
    if (!room) {
        return res.status(404).json({ error: "Room not found" });
    }

    if (userUuid !== room.hostId && userUuid !== room.joinerId) {
        return res.status(403).json({ error: "You are not a player in this room" });
    }

    if (room.status === 'finished') {
        return res.status(400).json({ error: "Round already finished" });
    }

    if (!room.choices) {
        room.choices = {};
    }

    room.choices[userUuid] = playerChoice;

    const playerIds = Object.keys(room.choices);
    if (playerIds.length === 2) {
        const [p1Id, p2Id] = playerIds;
        const p1Choice = room.choices[p1Id];
        const p2Choice = room.choices[p2Id];

        let winner = 'tie';
        if (p1Choice !== p2Choice) {
            winner =
                (p1Choice === 'rock' && p2Choice === 'scissors') ||
                (p1Choice === 'paper' && p2Choice === 'rock') ||
                (p1Choice === 'scissors' && p2Choice === 'paper')
                    ? p1Id
                    : p2Id;
        }

        room.status = "finished";

        return res.json({
            status: "finished",
            choices: room.choices,
            winner,
            currentUserId: userUuid
        });
    }

    return res.json({ status: "waiting_for_opponent" });
});

roomRouter.post('/:code/rematch', (req: any, res) => {
    const { code } = req.params;
    const userUuid = getPlayerId(req, res);
    if (!userUuid) return;

    const room = rooms[code];
    if (!room) {
        return res.status(404).json({ error: "Room not found" });
    }
    if (userUuid !== room.hostId && userUuid !== room.joinerId) {
        return res.status(403).json({ error: "You are not a player in this room" });
    }

    room.choices = {};
    room.status = room.joinerId ? 'started' : 'waiting';

    res.json({ status: room.status });
});

export default roomRouter;