import express from "express";
import cors from "cors";
import { z } from "zod";
import { db, newId, nowIso } from "./db.js";
import { searchFlights, searchHotels } from "./offers.js";
import type { Booking, Offer, TrackingPing } from "./types.js";

const app = express();

const PORT = Number(process.env.PORT || 5050);
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || "http://localhost:5173";

app.use(
  cors({
    origin: [FRONTEND_ORIGIN],
    credentials: false
  })
);
app.use(express.json({ limit: "1mb" }));

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, name: "travel-backend", time: Date.now() });
});

app.get("/api/places", async (_req, res) => {
  await db.read();
  res.json({ places: db.data.places });
});

const flightSearchSchema = z.object({
  from: z.string().min(2),
  to: z.string().min(2),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  passengers: z.number().int().min(1).max(9).default(1),
  currency: z.string().min(3).max(3).default("INR")
});

app.post("/api/search/flights", async (req, res) => {
  const parsed = flightSearchSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid input", issues: parsed.error.issues });
  const offers = searchFlights(parsed.data);
  res.json({ offers });
});

const hotelSearchSchema = z.object({
  city: z.string().min(2),
  nights: z.number().int().min(1).max(30).default(1),
  guests: z.number().int().min(1).max(8).default(1),
  currency: z.string().min(3).max(3).default("INR")
});

app.post("/api/search/hotels", async (req, res) => {
  const parsed = hotelSearchSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid input", issues: parsed.error.issues });
  const offers = searchHotels(parsed.data);
  res.json({ offers });
});

app.get("/api/bookings", async (_req, res) => {
  await db.read();
  const bookings = [...db.data.bookings].sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
  res.json({ bookings });
});

const bookingCreateSchema = z.object({
  passengerName: z.string().min(2),
  email: z.string().email().optional(),
  phone: z.string().min(6).max(20).optional(),
  mode: z.enum(["in_platform", "redirect"]).default("in_platform"),
  offer: z.custom<Offer>()
});

app.post("/api/bookings", async (req, res) => {
  const parsed = bookingCreateSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid input", issues: parsed.error.issues });

  const booking: Booking = {
    bookingId: newId("bkg"),
    createdAt: nowIso(),
    status: "confirmed",
    passengerName: parsed.data.passengerName,
    email: parsed.data.email,
    phone: parsed.data.phone,
    mode: parsed.data.mode,
    offer: parsed.data.offer
  };

  await db.read();
  db.data.bookings.push(booking);
  await db.write();

  res.json({ booking });
});

const trackingPingSchema = z.object({
  timestamp: z.number().int().optional(),
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
  accuracy: z.number().positive().optional()
});

app.post("/api/tracking/ping", async (req, res) => {
  const parsed = trackingPingSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid input", issues: parsed.error.issues });

  const ping: TrackingPing = {
    id: newId("trk"),
    timestamp: parsed.data.timestamp ?? Date.now(),
    lat: parsed.data.lat,
    lng: parsed.data.lng,
    accuracy: parsed.data.accuracy
  };

  await db.read();
  db.data.tracking.push(ping);
  db.data.tracking = db.data.tracking.slice(-2000);
  await db.write();

  res.json({ ping });
});

app.get("/api/tracking/history", async (req, res) => {
  const limit = Math.max(1, Math.min(500, Number(req.query.limit || 200)));
  await db.read();
  const history = [...db.data.tracking].sort((a, b) => b.timestamp - a.timestamp).slice(0, limit);
  res.json({ history });
});

if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    // eslint-disable-next-line no-console
    console.log(`Backend listening on http://localhost:${PORT}`);
  });
}

export default app;

