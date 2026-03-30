import { API_BASE } from "../env";
import type { Booking, FlightOffer, HotelOffer, TrackingPing, TravelPlace } from "../types";

async function jsonFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { "Content-Type": "application/json", ...(init?.headers || {}) },
    ...init
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Request failed: ${res.status}`);
  }
  return (await res.json()) as T;
}

export async function health() {
  return jsonFetch<{ ok: boolean; name: string; time: number }>("/api/health");
}

export async function getPlaces() {
  return jsonFetch<{ places: TravelPlace[] }>("/api/places");
}

export async function searchFlights(input: {
  from: string;
  to: string;
  date: string;
  passengers: number;
  currency: string;
}) {
  return jsonFetch<{ offers: FlightOffer[] }>("/api/search/flights", {
    method: "POST",
    body: JSON.stringify(input)
  });
}

export async function searchHotels(input: { city: string; nights: number; guests: number; currency: string }) {
  return jsonFetch<{ offers: HotelOffer[] }>("/api/search/hotels", {
    method: "POST",
    body: JSON.stringify(input)
  });
}

export async function listBookings() {
  return jsonFetch<{ bookings: Booking[] }>("/api/bookings");
}

export async function createBooking(input: {
  passengerName: string;
  email?: string;
  phone?: string;
  mode: "in_platform" | "redirect";
  offer: any;
}) {
  return jsonFetch<{ booking: Booking }>("/api/bookings", {
    method: "POST",
    body: JSON.stringify(input)
  });
}

export async function trackingPing(input: { lat: number; lng: number; accuracy?: number; timestamp?: number }) {
  return jsonFetch<{ ping: TrackingPing }>("/api/tracking/ping", {
    method: "POST",
    body: JSON.stringify(input)
  });
}

export async function trackingHistory(limit = 200) {
  return jsonFetch<{ history: TrackingPing[] }>(`/api/tracking/history?limit=${limit}`);
}

