import express from "express";
import bodyParser from "body-parser";
const app = express();

app.use(express.json());

app.post("/webhook", (req, res) => {
  console.log("Webhook Triggered!");
  console.log("Received Data:", req.body);

  console.log("Your webhook is working");

  res.status(200).send("Webhook received");
});





app.listen(3000, () => {
  console.log("server running on port 3000");
});