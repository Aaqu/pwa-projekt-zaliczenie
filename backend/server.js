import 'dotenv/config'
import express from 'express';
import mongoose from 'mongoose';
import bodyParser from 'body-parser';
import webpush from 'web-push';
import cors from 'cors';

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
const transactionSchema = new mongoose.Schema({
  description: String,
  amount: Number,
  type: String,
  date: String
});

const Transaction = mongoose.model('Transaction', transactionSchema);

const budgetSchema = new mongoose.Schema({
  amount: Number
});

const Budget = mongoose.model('Budget', budgetSchema);

// Subscriptions
let subscriptions = [];

// Endpoints API
app.post('/transactions', async (req, res) => {
  const tx = new Transaction(req.body);
  const saved = await tx.save();
  res.status(201).json(saved);
});

app.get('/transactions', async (req, res) => {
  const data = await Transaction.find();
  res.json(data);
});

app.post('/subscribe', (req, res) => {
  const isAlreadySubscribed = subscriptions.some(
    (sub) => sub.endpoint === req.body.endpoint
  );

  if (!isAlreadySubscribed) {
    subscriptions.push(req.body);
  }
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

app.delete('/transactions/:id', async (req, res) => {
  const id = req.params.id;
  await Transaction.findByIdAndDelete(id);
  res.sendStatus(200);
});

app.get('/budget', async (req, res) => {
  const budget = await Budget.findOne();
  res.json(budget || { amount: 0 });
});

app.post('/budget', async (req, res) => {
  const existing = await Budget.findOne();
  if (existing) {
    existing.amount = req.body.amount;
    await existing.save();
  } else {
    const budget = new Budget({ amount: req.body.amount });
    await budget.save();
  }
  res.sendStatus(200);
});

// Start server
app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});
