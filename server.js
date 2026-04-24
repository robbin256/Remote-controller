const express = require('express');
const path = require('path');
const http = require('http');
const { WebSocketServer } = require('ws');

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

const port = 8080;
const root = path.resolve(__dirname, 'public');

let mainClients = new Set();
let phoneClients = new Map(); // playerId → ws

const MAX_PLAYERS = 4;

app.use(express.static(root));

app.get('/', (req, res) => {
  res.sendFile(path.join(root, 'index.html'));
});

// 🔢 helper: vind vrije playerId
function getFreePlayerId() {
  for (let i = 1; i <= MAX_PLAYERS; i++) {
    if (!phoneClients.has(i)) return i;
  }
  return null;
}

wss.on('connection', (ws) => {
  console.log("Client connected");

  ws.playerId = null;

  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message);

      // 🖥️ MAIN CLIENT
      if (data.type === "main") {
        mainClients.add(ws);
        console.log("🖥️ Main connected");
        return;
      }

      // 📱 PHONE JOIN
      if (data.type === "join") {
        const id = getFreePlayerId();

        if (!id) {
          ws.send(JSON.stringify({ type: "full" }));
          return;
        }

        ws.playerId = id;
        phoneClients.set(id, ws);

        console.log(`📱 Player ${id} joined`);

        // stuur ID terug naar telefoon
        ws.send(JSON.stringify({
          type: "assigned",
          playerId: id
        }));

        // 🔥 vertel main dat er een nieuwe player is
        mainClients.forEach(client => {
          if (client.readyState === 1) {
            client.send(JSON.stringify({
              type: "playerJoined",
              playerId: id
            }));
          }
        });

        return;
      }

      // 📱 INPUT
      if (data.type === "phone") {
        if (!ws.playerId) return;

        data.playerId = ws.playerId;

        mainClients.forEach(client => {
          if (client.readyState === 1) {
            client.send(JSON.stringify(data));
          }
        });

        return;
      }

    } catch (err) {
      console.error("JSON error:", err);
    }
  });

  ws.on('close', () => {
    console.log("Client disconnected");

    mainClients.delete(ws);

    if (ws.playerId !== null) {
      phoneClients.delete(ws.playerId);
      console.log(`❌ Player ${ws.playerId} left`);
    }

    if (ws.playerId !== null) {

      mainClients.forEach(client => {
        if (client.readyState === 1) {
          client.send(JSON.stringify({
            type: "playerLeft",
            playerId: ws.playerId
          }));
        }
      });

      phoneClients.delete(ws.playerId);
    }
  });
});

server.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});