# Travel Booking Engine (Cross-Website MetaSearch) — Full Stack Demo

This is a working prototype inspired by platforms like **Skyscanner / KAYAK / Google Flights**.

It includes:
- **Booking meta-search** (Flights + Hotels) aggregated from **multiple mock providers**
- **Booking creation** + **booking history** persisted on the backend
- **Travel place location monitoring** (map + distance to places using browser GPS)
- **Live tracking** (browser geolocation pings → backend → map + path)

## Tech
- **Frontend**: React + Vite + TypeScript + React Router + Leaflet maps
- **Backend**: Node.js + Express + TypeScript + LowDB (JSON persistence)

## Pages
- `/` Home
- `/booking` Search flights/hotels + compare + create booking
- `/places` Places monitor (map + distance)
- `/tracking` Live tracking (sends GPS pings to backend)
- `/history` Booking history

## Backend API (summary)
- `GET /api/health`
- `POST /api/search/flights`
- `POST /api/search/hotels`
- `GET /api/places`
- `GET /api/bookings`
- `POST /api/bookings`
- `POST /api/tracking/ping`
- `GET /api/tracking/history?limit=200`

## Run (Windows / PowerShell)

### 1) Start backend

```powershell
cd backend
npm install
npm run dev
```

Backend runs on **`http://localhost:5050`**.

### 2) Start frontend

Open a new terminal:

```powershell
cd frontend
npm install
npm run dev
```

Frontend runs on **`http://localhost:5173`**.

## Configuration

### Frontend → backend URL

Option A (default): it uses `http://localhost:5050`.

Option B: create `frontend/.env` from `frontend/.env.example`:

```env
VITE_API_BASE=http://localhost:5050
```

### Backend CORS origin

Create `backend/.env` from `backend/.env.example` if needed:

```env
PORT=5050
FRONTEND_ORIGIN=http://localhost:5173
```

## Notes
- All “cross-website provider results” are **mock aggregated offers** (so no API keys needed).
- Tracking uses **browser Geolocation**; allow location permissions when prompted.

