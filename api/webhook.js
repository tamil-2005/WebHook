export default async function handler(req, res) {
  if (req.method === "POST") {
    let body = "";

    // Read raw request body
    for await (const chunk of req) {
      body += chunk;
    }

    try {
      global.lastReceivedData = JSON.parse(body);
    } catch (err) {
      return res.status(400).json({ error: "Invalid JSON" });
    }

    // Send update to SSE clients
    (global.clients || []).forEach(client => {
      client.write(`data: ${JSON.stringify(global.lastReceivedData)}\n\n`);
    });

    return res.status(200).json({ message: "Webhook received" });
  }

  res.status(405).json({ error: "Method not allowed" });
}
