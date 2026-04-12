import { newId } from "./db.js";
function clamp(n, min, max) {
    return Math.max(min, Math.min(max, n));
}
function hashCode(s) {
    let h = 0;
    for (let i = 0; i < s.length; i++)
        h = (h * 31 + s.charCodeAt(i)) | 0;
    return Math.abs(h);
}
function seededRandom(seed) {
    let x = hashCode(seed) % 2147483647;
    if (x <= 0)
        x += 2147483646;
    return () => (x = (x * 16807) % 2147483647) / 2147483647;
}
const flightProviders = [
    "Indigo",
    "AirIndia",
    "MakeMyTrip",
    "Amadeus",
    "Travelport"
];
const hotelProviders = ["Booking", "Expedia", "Agoda"];
export function searchFlights(input) {
    const r = seededRandom(`${input.from}|${input.to}|${input.date}|${input.passengers}|${input.currency}`);
    const base = 3800 + Math.floor(r() * 2200);
    const paxMult = 1 + clamp((input.passengers - 1) * 0.04, 0, 0.25);
    const offers = flightProviders.map((provider, idx) => {
        const duration = 135 + Math.floor(r() * 95) + idx * 6;
        const stops = r() > 0.82 ? 1 : 0;
        const departHour = 6 + Math.floor(r() * 14);
        const departMin = r() > 0.5 ? 0 : 30;
        const departTime = `${String(departHour).padStart(2, "0")}:${String(departMin).padStart(2, "0")}`;
        const arriveTotalMinutes = departHour * 60 + departMin + duration + (stops ? 55 : 0);
        const arriveHour = Math.floor(arriveTotalMinutes / 60) % 24;
        const arriveMin = arriveTotalMinutes % 60;
        const arriveTime = `${String(arriveHour).padStart(2, "0")}:${String(arriveMin).padStart(2, "0")}`;
        const providerAdj = 0.92 + idx * 0.05 + (stops ? -0.03 : 0);
        const price = Math.round(base * paxMult * providerAdj);
        const airline = provider === "Indigo" ? "IndiGo" : provider === "AirIndia" ? "Air India" : "Partner Airline";
        const flightNumber = provider === "Indigo"
            ? `6E ${100 + Math.floor(r() * 900)}`
            : provider === "AirIndia"
                ? `AI ${100 + Math.floor(r() * 900)}`
                : `PA ${100 + Math.floor(r() * 900)}`;
        return {
            kind: "flight",
            offerId: newId("flt"),
            provider,
            from: input.from,
            to: input.to,
            departDate: input.date,
            airline,
            flightNumber,
            departTime,
            arriveTime,
            durationMinutes: duration,
            stops,
            price: { currency: input.currency, total: price },
            deepLink: `https://example.com/redirect/${provider.toLowerCase()}/flight`
        };
    });
    return offers.sort((a, b) => a.price.total - b.price.total);
}
export function searchHotels(input) {
    const r = seededRandom(`${input.city}|${input.nights}|${input.guests}|${input.currency}`);
    const base = 1200 + Math.floor(r() * 2200);
    const guestsMult = 1 + clamp((input.guests - 1) * 0.15, 0, 0.75);
    const hotelNames = [
        `${input.city} Grand Residency`,
        `The ${input.city} Plaza`,
        `${input.city} Central Inn`,
        `${input.city} Boutique Suites`,
        `${input.city} Riverside Hotel`
    ];
    const offers = hotelProviders.flatMap((provider, idx) => {
        const count = 2 + (r() > 0.55 ? 1 : 0);
        return Array.from({ length: count }).map((_, j) => {
            const rating = clamp(3 + Math.round(r() * 2), 2, 5);
            const hotelName = hotelNames[(idx + j) % hotelNames.length];
            const providerAdj = 0.95 + idx * 0.06 + j * 0.03 + (rating >= 5 ? 0.1 : 0);
            const total = Math.round(base * providerAdj * guestsMult * input.nights);
            return {
                kind: "hotel",
                offerId: newId("htl"),
                provider,
                city: input.city,
                hotelName,
                rating,
                nights: input.nights,
                price: { currency: input.currency, total },
                deepLink: `https://example.com/redirect/${provider.toLowerCase()}/hotel`
            };
        });
    });
    return offers.sort((a, b) => a.price.total - b.price.total);
}
