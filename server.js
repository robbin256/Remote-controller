const express = require('express');
const path = require('path');
const http = require('http');
const { WebSocketServer } = require('ws');

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

const port = 8080;
const root = path.resolve(__dirname, 'public');

// Clients
let phoneClient = null;
let mainClients = new Set();

app.use(express.static(root));

app.get('/', (req, res) => {
  res.sendFile(path.join(root, 'index.html'));
});

wss.on('connection', (ws) => {
  console.log("Client connected");

  ws.isMain = false;
  ws.isPhone = false;

  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message);
      // console.log("Received:", data);

      // 🖥️ REGISTER MAIN CLIENT
      if (data.type === "main") {
        ws.isMain = true;
        mainClients.add(ws);
        console.log("🖥️ Main client registered");
        return;
      }

      // 📱 PHONE INPUT
      if (data.type === "phone") {
        ws.isPhone = true;
        phoneClient = ws;

        console.log("📱 Phone input received");

        mainClients.forEach(client => {
          if (client.readyState === 1) { // OPEN
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

    if (phoneClient === ws) {
      phoneClient = null;
    }
  });

});

server.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});