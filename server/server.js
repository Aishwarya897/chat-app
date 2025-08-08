const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const MESSAGE_HISTORY_LIMIT = 200;
const messageHistory = [];

function broadcast(data, exclude) {
  const raw = JSON.stringify(data);
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN && client !== exclude) {
      client.send(raw);
    }
  });
}

wss.on('connection', (ws) => {
  // Send history to newly connected client
  ws.send(JSON.stringify({ type: 'history', data: messageHistory }));

  ws.on('message', (message) => {
    try {
      const parsed = JSON.parse(message);
      if (parsed.type === 'message') {
        const msg = {
          id: Date.now() + '-' + Math.random().toString(36).slice(2, 9),
          user: parsed.user || 'Anonymous',
          text: parsed.text || '',
          ts: new Date().toISOString(),
        };

        messageHistory.push(msg);
        if (messageHistory.length > MESSAGE_HISTORY_LIMIT) messageHistory.shift();

        // broadcast to all clients
        broadcast({ type: 'message', data: msg });
      }
    } catch (err) {
      console.error('Failed to parse message', err);
    }
  });

  ws.on('close', () => {
    // Optional: broadcast user left
  });
});

app.get('/history', (req, res) => {
  res.json(messageHistory);
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(Server listening on http://localhost:${PORT});
});
