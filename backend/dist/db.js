import path from "node:path";
import { fileURLToPath } from "node:url";
import { JSONFilePreset } from "lowdb/node";
import { nanoid } from "nanoid";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const isVercel = !!process.env.VERCEL;
const dbFile = isVercel ? "/tmp/db.json" : path.join(__dirname, "..", "data", "db.json");
const seedPlaces = [
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
const defaultData = {
    bookings: [],
    tracking: [],
    places: seedPlaces
};
export const db = await JSONFilePreset(dbFile, defaultData);
export function nowIso() {
    return new Date().toISOString();
}
export function newId(prefix) {
    return `${prefix}_${nanoid(10)}`;
}
