import express from "express";
import cors from "cors";

const app = express();
app.use(express.json());
app.use(cors());

let lastReceivedData = null;

// SSE Clients
let clients = [];

// SSE Endpoint (auto updates)
app.get("/events", (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  clients.push(res);

  // Remove dead client
  req.on("close", () => {
    clients = clients.filter(c => c !== res);
  });
});

// POST webhook (send update to all connected clients)
app.post("/webhook", (req, res) => {
  lastReceivedData = req.body;

  console.log("Received POST:", lastReceivedData);

  // Notify all clients automatically (NO need to reload)
  clients.forEach(c => {
    c.write(`data: ${JSON.stringify(lastReceivedData)}\n\n`);
  });

  res.status(200).send("Webhook received");
});

// GET for manual check
app.get("/webhook", (req, res) => {
  res.json(lastReceivedData || { message: "No data yet" });
});

app.listen(3000, () => console.log("Server running on port 3000"));
