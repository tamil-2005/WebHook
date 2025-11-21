export default function handler(req, res) {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  if (!global.clients) global.clients = [];
  global.clients.push(res);

  req.on("close", () => {
    global.clients = global.clients.filter(c => c !== res);
  });
}
