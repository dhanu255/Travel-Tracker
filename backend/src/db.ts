import path from "node:path";
import { fileURLToPath } from "node:url";
import { JSONFilePreset } from "lowdb/node";
import { nanoid } from "nanoid";
import type { DbData, TravelPlace } from "./types.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbFile = path.join(__dirname, "..", "data", "db.json");

const seedPlaces: TravelPlace[] = [
  {
    id: "place_goa",
    name: "Baga Beach",
    city: "Goa",
    country: "India",
    lat: 15.5525,
    lng: 73.7517,
    tags: ["beach", "nightlife"]
  },
  {
    id: "place_delhi",
    name: "India Gate",
    city: "New Delhi",
    country: "India",
    lat: 28.6129,
    lng: 77.2295,
    tags: ["monument", "family"]
  },
  {
    id: "place_agra",
    name: "Taj Mahal",
    city: "Agra",
    country: "India",
    lat: 27.1751,
    lng: 78.0421,
    tags: ["wonder", "monument"]
  },
  {
    id: "place_chennai",
    name: "Marina Beach",
    city: "Chennai",
    country: "India",
    lat: 13.0500,
    lng: 80.2824,
    tags: ["beach", "sunset"]
  }
];

const defaultData: DbData = {
  bookings: [],
  tracking: [],
  places: seedPlaces
};

export const db = await JSONFilePreset<DbData>(dbFile, defaultData);

export function nowIso() {
  return new Date().toISOString();
}

export function newId(prefix: string) {
  return `${prefix}_${nanoid(10)}`;
}
