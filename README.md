# Personal Finance PWA 💰

A Progressive Web Application (PWA) for tracking income and expenses, setting budgets, generating reports, and analyzing personal finances.

**Date:** 2025-05-15  
**Technologies:** JavaScript, Node.js, MongoDB, Bootstrap, Chart.js, Service Workers, Web Push API

---

## Features

- **Add income and expense transactions**
- **Set a monthly budget**
- **Pie chart for income vs expenses**
- **Push notifications when budget is exceeded**
- **Real-time analysis of financial balance**
- **Offline support using Local Storage + Service Worker**
- **MongoDB Atlas integration for persistent storage**

---

## Project Structure

```
/frontend
  ├── index.html
  ├── app.js
  ├── style.css
  ├── manifest.json
  └── service-worker.js

/backend
  ├── server.js
  ├── package.json
  └── .env
```

---

## How to Run

### 1. Clone the repository

```bash
git clone https://github.com/Aaqu/pwa-projekt-zaliczenie.git
```

### 2. Set up the backend

- Install dependencies:
```bash
cd backend
npm install
```
- Create KEYS to .env file
```
web-push generate-vapid-keys
```

- Create `.env` file with the following:
```
VAPID_PUBLIC_KEY=your_public_key
VAPID_PRIVATE_KEY=your_private_key
MONGODB_URI=your_mongodb_connection_string
```

- Start the server:
```bash
npm start
```

### 3. Open frontend

Serve the `frontend/` folder using Live Server or any HTTP server:
```
cd frontend
npx serve .
```

Then open `http://localhost:3000` in your browser.

---

## PWA Notes

- Works offline thanks to Service Worker and Local Storage fallback
- Installable on desktop and mobile devices
- Push notifications triggered when expenses exceed the set budget

---

**Authors:** Alber Mazur, Jakub Orłowski
