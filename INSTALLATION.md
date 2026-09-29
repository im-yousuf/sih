# Installation Guide — Baghewala Digital Twin

> **Quick-start:** If you're on Windows, skip to [One-Click Start](#one-click-start-windows) below.  
> Everything else is covered in the step-by-step sections.

---

## Prerequisites

Install these before anything else.

| Tool | Minimum Version | Download |
|---|---|---|
| **Python** | 3.8 | https://python.org/downloads |
| **Node.js** | 18 LTS | https://nodejs.org |
| **npm** | 9 *(ships with Node 18)* | — |
| **PostgreSQL** | 13 | https://postgresql.org *(optional — app runs in demo mode without it)* |
| **Git** | Any | https://git-scm.com |

Verify your versions:
```bash
python --version    # Python 3.x.x
node --version      # v18.x.x
npm --version       # 9.x.x
```

---

## One-Click Start (Windows)

The fastest way to run both servers simultaneously:

```
start.bat
```

What it does automatically:
1. Checks that Python and Node are on PATH — exits with a clear error if not
2. Activates `backend/venv` if it exists, or falls back to system Python
3. Starts the FastAPI backend via `uvicorn` in a new terminal window
4. Waits 6 seconds for the backend to bind
5. Runs `npm install` if `node_modules` is missing (first run only)
6. Starts the Vite dev server in a second terminal window
7. Prints all access URLs and demo credentials in the launcher window
8. Press **any key** in the launcher window to kill both servers cleanly

---

## Step-by-Step Manual Setup

### Step 1 — Clone the Repository

```bash
git clone https://github.com/im-yousuf/sih.git
cd sih
```

---

### Step 2 — Backend Setup

```bash
cd backend
```

#### 2a. Create a virtual environment

```bash
python -m venv venv
```

#### 2b. Activate it

```bash
# Windows
venv\Scripts\activate

# macOS / Linux
source venv/bin/activate
```

You should see `(venv)` prepended to your prompt.

#### 2c. Install dependencies

**Option A — Full install** *(requires PostgreSQL, recommended for production-like testing):*
```bash
pip install -r requirements.txt
```

**Option B — Demo mode** *(no database required, fastest for a quick demo):*
```bash
pip install -r requirements-demo.txt
```

> The backend auto-detects missing dependencies and falls back to in-memory simulation, so the UI is fully functional without PostgreSQL.

#### 2d. Configure environment variables

Create a file called `.env` inside the `backend/` folder:

```bash
# backend/.env

DATABASE_URL=postgresql://postgres:postgres@localhost:5432/baghewala_digital_twin
```

Skip this file entirely if you're using demo mode — the backend will start without it.

#### 2e. Start the backend server

```bash
# From inside the backend/ directory, with venv active
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

You should see:
```
INFO:     Uvicorn running on http://0.0.0.0:8000 (Press CTRL+C to quit)
INFO:     Started reloader process
INFO:     Started server process
INFO:     Waiting for application startup.
INFO:     Application startup complete.
```

| Endpoint | URL |
|---|---|
| Backend API | http://localhost:8000 |
| Interactive API docs (Swagger) | http://localhost:8000/docs |
| Redoc | http://localhost:8000/redoc |
| WebSocket | ws://localhost:8000/ws/digital-twin |

---

### Step 3 — Frontend Setup

Open a **new terminal** (keep the backend running).

```bash
# From the repo root
cd frontend
```

#### 3a. Install dependencies

```bash
npm install
```

This only needs to run once (or whenever `package.json` changes).

#### 3b. Configure environment variables

Create a file called `.env` inside the `frontend/` folder:

```bash
# frontend/.env

VITE_API_URL=http://localhost:8000
VITE_WS_URL=ws://localhost:8000/ws/digital-twin
```

#### 3c. Start the Vite dev server

```bash
npm run dev
```

You should see:
```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: http://192.168.x.x:5173/
```

| URL | Description |
|---|---|
| http://localhost:5173 | Application (login page) |

---

### Step 4 — Log In

Open http://localhost:5173 in your browser. Use one of the demo accounts:

| Role | Email | Password | Lands on |
|---|---|---|---|
| **Field Supervisor** | `supervisor@oil.com` | `supervisor123` | Supervisor Fleet Dashboard |
| **Well Incharge (BW-14)** | `incharge14@oil.com` | `incharge123` | Well BW-14 Digital Twin |

---

## Production Build (Frontend)

To generate a static build for deployment:

```bash
cd frontend
npm run build
```

Output is written to `frontend/dist/`. Serve it with any static host (Nginx, Vercel, etc.) or preview it locally:

```bash
npm run preview
# → http://localhost:4173
```

---

## Environment Variables Reference

### `backend/.env`

| Variable | Default | Description |
|---|---|---|
| `DATABASE_URL` | *(none — demo mode)* | PostgreSQL connection string |

### `frontend/.env`

| Variable | Default | Description |
|---|---|---|
| `VITE_API_URL` | `http://localhost:8000` | FastAPI base URL |
| `VITE_WS_URL` | `ws://localhost:8000/ws/digital-twin` | WebSocket endpoint |

---

## Troubleshooting

### Backend

**`ModuleNotFoundError: No module named 'uvicorn'`**
```bash
# Ensure your venv is activated, then:
pip install uvicorn[standard]
# or re-run:
pip install -r requirements-demo.txt
```

**`uvicorn: command not found` (macOS / Linux)**
```bash
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

**Database connection error at startup**
> This is expected if PostgreSQL is not running. The backend falls back to demo mode automatically. You will see a warning in the console but the server still starts.

**Port 8000 already in use**
```bash
# Windows — find and kill the process using port 8000
netstat -ano | findstr :8000
taskkill /PID <PID> /F

# macOS / Linux
lsof -ti:8000 | xargs kill -9
```

---

### Frontend

**`npm install` fails with ERESOLVE**
```bash
npm cache clean --force
npm install --legacy-peer-deps
```

**Port 5173 already in use**

Edit `frontend/vite.config.ts` and add a `server.port` override:
```ts
export default defineConfig({
  server: { port: 5174 },   // change to any free port
  // ...
})
```
Remember to update `VITE_API_URL` in `.env` if you also move the backend.

**Blank page / no data after login**
1. Confirm the backend is running at http://localhost:8000
2. Check that `frontend/.env` has the correct `VITE_API_URL` and `VITE_WS_URL`
3. Open browser DevTools → Network tab and look for failed WebSocket connections

**CORS error in the browser console**
The FastAPI app allows `localhost:5173` by default. If you changed the frontend port, update the `allow_origins` list in `backend/main.py`.

---

## Full Dependency List

### Backend (`requirements.txt`)

```
fastapi==0.104.1
uvicorn[standard]==0.24.0
sqlalchemy==2.0.23
psycopg2-binary==2.9.9
pydantic==2.5.0
pydantic-settings==2.1.0
python-multipart==0.0.6
websockets==12.0
numpy==1.26.2
pandas==2.1.3
scipy==1.11.4
scikit-learn==1.3.2
torch==2.1.1
httpx==0.25.2
python-jose[cryptography]==3.3.0
passlib[bcrypt]==1.7.4
alembic==1.13.0
redis==5.0.1
celery==5.3.4
```

### Frontend (key packages from `package.json`)

```
react@^18.2.0
react-dom@^18.2.0
react-router-dom@^6.20.0
zustand@^4.4.7
three@^0.159.0
@react-three/fiber@^8.15.11
@react-three/drei@^9.88.13
recharts@^2.10.3
lucide-react@^0.294.0
i18next@^23.x
react-i18next@^13.x
tailwindcss@^3.3.0
vite@^5.0.0
typescript@^5.0.0
```

---

## Development Tips

- The Vite dev server supports **Hot Module Replacement** — most UI changes reflect instantly without a full reload.
- The backend runs with `--reload`, so Python file changes restart the server automatically.
- All physics models run in simulation mode by default. No real field connections are made.
- WebSocket telemetry updates every **2 seconds**. Reservoir and AI state refresh every **8 seconds** via REST polling.
- The Zustand store is ephemeral (in-memory). Refreshing the browser resets all UI state; the backend re-hydrates it on reconnect.

---

*For further details see [README.md](./README.md) and the demo script in [guide.md](./guide.md).*
