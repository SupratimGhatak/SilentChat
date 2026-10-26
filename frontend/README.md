# SilentChat Frontend

A private, locally hosted AI chat interface built with React + Vite. All communication stays on your machine — no data is sent to the cloud.

## Features

- 💬 Multi-conversation management with localStorage persistence
- 🌙 Dark theme with polished UI
- 📝 Markdown rendering with syntax-highlighted code blocks
- 🔄 Real-time backend status indicator
- 📱 Responsive — works on desktop and mobile
- ⌨️ Inline conversation renaming (double-click)

---

## Prerequisites

Before running the frontend, ensure the following are installed and running:

| Requirement | Version | Notes |
|---|---|---|
| Node.js | 18+ | [nodejs.org](https://nodejs.org) |
| npm | 9+ | Comes with Node.js |
| SilentChat Backend | latest | FastAPI server must be running |
| Ollama | latest | Must have `qwen3:8b` model loaded |

---

## Setup

### 1. Install dependencies

```bash
cd frontend
npm install
```

### 2. Configure the environment

Copy the example env file and edit it if needed:

```bash
cp .env.example .env
```

Open `.env` and set the backend URL:

```
VITE_API_BASE_URL=http://127.0.0.1:8000
```

> **Note:** If your FastAPI backend runs on a different port or host, update this value accordingly.

---

## Development

Start the Vite dev server:

```bash
npm run dev
```

Open your browser at [http://localhost:5173](http://localhost:5173).

The dev server hot-reloads automatically on file changes.

---

## Production Build

```bash
npm run build
```

Output goes to `frontend/dist/`. Serve this folder with any static file server:

```bash
npm run preview
# or
npx serve dist
```

---

## Running Both Backend and Frontend

### Option A — Two terminals

**Terminal 1 — Backend:**
```bash
cd backend
# Activate your Python virtual environment first
uvicorn main:app --host 127.0.0.1 --port 8000 --reload
```

**Terminal 2 — Frontend:**
```bash
cd frontend
npm run dev
```

### Option B — Using the root start scripts (if provided)

```bash
# From the SilentChat root directory
npm run start   # or python start.py
```

---

## Project Structure

```
frontend/
├── public/
│   └── favicon.svg
├── src/
│   ├── components/
│   │   ├── ChatArea.jsx        # Main chat view
│   │   ├── ChatArea.css
│   │   ├── Sidebar.jsx         # Conversation sidebar
│   │   ├── Sidebar.css
│   │   ├── Message.jsx         # Single message (user + assistant)
│   │   ├── MessageList.jsx     # Scrollable message list
│   │   ├── Composer.jsx        # Text input + send button
│   │   ├── WelcomeScreen.jsx   # Shown for empty conversations
│   │   ├── StatusIndicator.jsx # Backend connection dot
│   │   └── TypingIndicator.jsx # Three-dot loading animation
│   ├── hooks/
│   │   └── useConversations.js # Conversation state + localStorage
│   ├── api.js                  # All backend API calls
│   ├── App.jsx                 # Root component
│   ├── App.css
│   ├── main.jsx                # React entry point
│   └── index.css               # Global styles + CSS variables
├── .env                        # Local env (gitignored)
├── .env.example                # Example env file
├── index.html
├── package.json
└── vite.config.js
```

---

## Troubleshooting

### "Cannot reach the SilentChat backend"

- Make sure the FastAPI server is running: `uvicorn main:app --reload`
- Check that the port in `.env` matches the backend port (default: `8000`)
- Look for CORS errors in the browser console — the backend must allow `http://localhost:5173`

### "The AI model is not available" (503)

- Make sure Ollama is running: `ollama serve`
- Pull the model if not yet downloaded: `ollama pull qwen3:8b`
- Check that the backend's `OLLAMA_MODEL` env variable matches the pulled model name

### Page is blank / JS errors

- Delete `node_modules` and reinstall: `npm ci`
- Ensure you are using Node.js 18 or newer: `node --version`

### Conversations not persisting

- SilentChat stores conversations in `localStorage`. If you are in a private/incognito window, data will not persist between sessions.
- Check browser storage quota — clearing site data and restarting fixes quota issues.

---

## Tech Stack

| Library | Purpose |
|---|---|
| React 18 | UI framework |
| Vite 6 | Build tool & dev server |
| lucide-react | Icon library |
| react-markdown | Markdown rendering |
| remark-gfm | GitHub Flavored Markdown |
| react-syntax-highlighter | Code block syntax highlighting |
