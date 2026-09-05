const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const config = require('./config.json');
const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

const rooms = {};

function generateRandomCode(size = 5) {
  const alphabet = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "";
  for (let i = 0; i < size; i++) {
    const randomIndex = Math.floor(Math.random() * alphabet.length);
    result += alphabet[randomIndex];
  }
  return result;
}

app.post('/enter', (req, res) => {
  let { code } = req.body;

  // If no code was provided or generated, make a random one
  if (!code || code.trim() === "") {
    do {
      code = generateRandomCode();
    } while (rooms[code] !== undefined);
  }

  // If the room doesn't exist, create it
  if (!rooms[code]) {
    rooms[code] = { players: [] };
    console.log(`Created room ${code}`)
    return res.json({ action: "created", success: true, code });
  }

  // If the room already exists, join it
  res.json({ action: "joined", success: true, code });
});

app.listen(config.port, () => {
  console.log(`Listening on port ${config.port}.`);
});