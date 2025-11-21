export default function handler(req, res) {
  if (req.method === "POST") {
    global.lastReceivedData = req.body;

    (global.clients || []).forEach(client => {
      client.write(`data: ${JSON.stringify(global.lastReceivedData)}\n\n`);
    });

    return res.status(200).json({ message: "Webhook received" });
  }

  res.status(405).json({ error: "Method not allowed" });
}
