export default function handler(req, res) {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache, no-transform");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders(); // ⭐ important on Vercel to start SSE immediately

  if (!global.clients) global.clients = [];
  global.clients.push(res);

  // heartbeat to keep connection alive on Vercel
  const keepAlive = setInterval(() => {
    res.write(":\n\n"); // SSE comment event
  }, 15000);

  req.on("close", () => {
    clearInterval(keepAlive);
    global.clients = global.clients.filter(c => c !== res);
  });
}
