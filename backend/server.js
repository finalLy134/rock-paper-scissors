const express = require('express')
const cors = require('cors')
const app = express()

app.use(cors());

const port = 3000

const FRONTEND_BASE_URL = "http://localhost:5500"
const MAX_TRIES = 5
const ROOM_ID_LENGTH = 5

const rooms = []

function makeId(length) {
    var result           = '';
    var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for ( var i = 0; i < length; i++ ) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

function createRoom(req, res, roomId = undefined) {
    if (roomId == undefined && rooms[roomId] == null) {
        let interval = 0, tries = 1;
        let roomId = makeId(ROOM_ID_LENGTH);

        while (rooms[roomId] != null && tries < MAX_TRIES) {
            roomId = makeId(ROOM_ID_LENGTH + interval);
            interval++;
        }
    }

    rooms[roomId] = {
        owner: {
            ip: req.ip,
            req: req
        }
    };

    return roomId;
}

app.post('/room', (req, res) => {
    res.redirect(`http://localhost:${port}/room/${createRoom(req, res)}`);
});

app.get('/room/:id', (req, res) => {
    const params = req.params
    const query = req.query

    const roomId = params['id'];

    if (rooms[roomId] != null) {
        res.status(201).send({message: 'ok'})
    } else {
        createRoom(req, res, roomId);
    }
});

app.listen(port, () => {
    console.log(`App listening on port ${port}`)
});