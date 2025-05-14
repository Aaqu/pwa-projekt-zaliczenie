require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const webpush = require('web-push');
const cors = require('cors');

const app = express();
const PORT = 3000;

// Load keys from .env
const vapidKeys = {
  publicKey: process.env.VAPID_PUBLIC_KEY,
  privateKey: process.env.VAPID_PRIVATE_KEY
};
const mongoUri = process.env.MONGODB_URI;

webpush.setVapidDetails(
  'mailto:jakub.orlowski89@gmail.com',
  vapidKeys.publicKey,
  vapidKeys.privateKey
);

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Connection to MongoDB
mongoose.connect(mongoUri, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

// Data model
const Transaction = mongoose.model('Transaction', {
  description: String,
  amount: Number,
  type: String,
  date: String
});

// Subscriptions
let subscriptions = [];

// Endpoints API
app.post('/transactions', async (req, res) => {
  const tx = new Transaction(req.body);
  await tx.save();
  res.sendStatus(201);
});

app.get('/transactions', async (req, res) => {
  const data = await Transaction.find();
  res.json(data);
});

app.post('/subscribe', (req, res) => {
  subscriptions.push(req.body);
  res.sendStatus(201);
});

app.post('/notify', async (req, res) => {
  const payload = JSON.stringify({
    title: 'Budget Alert',
    body: 'You have exceeded your monthly budget!'
  });

  subscriptions.forEach(sub => {
    webpush.sendNotification(sub, payload).catch(console.error);
  });

  res.sendStatus(200);
});

// Start serwer
app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});
