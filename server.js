import express from "express";
import cors from "cors";
import { WebSocketServer } from "ws";

const app = express();
app.use(express.json());
app.use(cors());

// Store last data
let lastReceivedData = null;

// -----------------------------
//   SSE IMPLEMENTATION
// -----------------------------
let clients = [];

app.get("/events", (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  clients.push(res);

  req.on("close", () => {
    clients = clients.filter(c => c !== res);
  });
});

// -----------------------------
//   WEBSOCKET IMPLEMENTATION
// -----------------------------
const server = app.listen(3000, () =>
  console.log("HTTP server running on port 3000")
);

// Create WebSocket server
const wss = new WebSocketServer({ server, path: "/live" });

wss.on("connection", ws => {
  console.log("WebSocket client connected");

  // Send last data immediately on connect
  if (lastReceivedData) {
    ws.send(JSON.stringify(lastReceivedData));
  }

  ws.on("close", () => console.log("WebSocket client disconnected"));
});

// Broadcast function (used by webhook)
function broadcastWebSocket(data) {
  wss.clients.forEach(client => {
    if (client.readyState === 1) {
      client.send(JSON.stringify(data));
    }
  });
}

// -----------------------------
//   WEBHOOK – SEND TO SSE + WS
// -----------------------------
app.post("/webhook", (req, res) => {
  lastReceivedData = req.body;
  console.log("Received POST:", lastReceivedData);

  // SSE Broadcast
  clients.forEach(c => {
    c.write(`data: ${JSON.stringify(lastReceivedData)}\n\n`);
  });

  // WebSocket Broadcast
  broadcastWebSocket(lastReceivedData);

  res.status(200).send("Webhook received");
});

// Manual GET
app.get("/webhook", (req, res) => {
  res.json(lastReceivedData || { message: "No data yet" });
});
