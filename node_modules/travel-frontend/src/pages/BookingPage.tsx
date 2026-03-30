import { useMemo, useState } from "react";
import type { FlightOffer, HotelOffer, Offer } from "../types";
import { createBooking, searchFlights, searchHotels } from "../lib/api";
import { minutesToDuration, money } from "../lib/format";

type Tab = "flights" | "hotels";

export default function BookingPage() {
  const [tab, setTab] = useState<Tab>("flights");
  const [currency, setCurrency] = useState("INR");

  const [flightFrom, setFlightFrom] = useState("Chennai");
  const [flightTo, setFlightTo] = useState("Delhi");
  const [flightDate, setFlightDate] = useState(() => new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10));
  const [passengers, setPassengers] = useState(1);

  const [hotelCity, setHotelCity] = useState("Goa");
  const [nights, setNights] = useState(2);
  const [guests, setGuests] = useState(2);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [offers, setOffers] = useState<Offer[]>([]);

  const [selectedOffer, setSelectedOffer] = useState<Offer | null>(null);
  const [passengerName, setPassengerName] = useState("Dhanu");
  const [email, setEmail] = useState("");
  const [mode, setMode] = useState<"in_platform" | "redirect">("in_platform");
  const [bookingResult, setBookingResult] = useState<string>("");

  const title = useMemo(() => {
    if (!selectedOffer) return "";
    if (selectedOffer.kind === "flight") return `${selectedOffer.from} → ${selectedOffer.to}`;
    return `${selectedOffer.city} • ${selectedOffer.hotelName}`;
  }, [selectedOffer]);

  async function runSearch() {
    setLoading(true);
    setError(null);
    setOffers([]);
    setSelectedOffer(null);
    setBookingResult("");
    try {
      if (tab === "flights") {
        const r = await searchFlights({ from: flightFrom, to: flightTo, date: flightDate, passengers, currency });
        setOffers(r.offers);
      } else {
        const r = await searchHotels({ city: hotelCity, nights, guests, currency });
        setOffers(r.offers);
      }
    } catch (e: any) {
      setError(e?.message || String(e));
    } finally {
      setLoading(false);
    }
  }

  async function bookNow() {
    if (!selectedOffer) return;
    setLoading(true);
    setError(null);
    setBookingResult("");
    try {
      const r = await createBooking({
        passengerName,
        email: email || undefined,
        mode,
        offer: selectedOffer
      });
      setBookingResult(`Booked: ${r.booking.bookingId} (${r.booking.status})`);
      if (mode === "redirect" && selectedOffer.deepLink) {
        window.open(selectedOffer.deepLink, "_blank", "noopener,noreferrer");
      }
    } catch (e: any) {
      setError(e?.message || String(e));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="stack">
      <section className="pageTitle">
        <div>
          <h2>Booking</h2>
          <div className="muted">Meta-search across providers (mock data) + booking creation.</div>
        </div>
        <div className="row">
          <label className="fieldInline">
            <span>Currency</span>
            <select value={currency} onChange={(e) => setCurrency(e.target.value)}>
              <option value="INR">INR</option>
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
            </select>
          </label>
        </div>
      </section>

      <section className="card">
        <div className="tabs">
          <button className={tab === "flights" ? "tab active" : "tab"} onClick={() => setTab("flights")}>
            Flights
          </button>
          <button className={tab === "hotels" ? "tab active" : "tab"} onClick={() => setTab("hotels")}>
            Hotels
          </button>
        </div>

        {tab === "flights" ? (
          <div className="formGrid">
            <label className="field">
              <span>From</span>
              <input value={flightFrom} onChange={(e) => setFlightFrom(e.target.value)} placeholder="City / Airport" />
            </label>
            <label className="field">
              <span>To</span>
              <input value={flightTo} onChange={(e) => setFlightTo(e.target.value)} placeholder="City / Airport" />
            </label>
            <label className="field">
              <span>Date</span>
              <input type="date" value={flightDate} onChange={(e) => setFlightDate(e.target.value)} />
            </label>
            <label className="field">
              <span>Passengers</span>
              <input
                type="number"
                min={1}
                max={9}
                value={passengers}
                onChange={(e) => setPassengers(Number(e.target.value))}
              />
            </label>
            <div className="formActions">
              <button className="btn" onClick={runSearch} disabled={loading}>
                {loading ? "Searching…" : "Search flights"}
              </button>
            </div>
          </div>
        ) : (
          <div className="formGrid">
            <label className="field">
              <span>City</span>
              <input value={hotelCity} onChange={(e) => setHotelCity(e.target.value)} placeholder="City" />
            </label>
            <label className="field">
              <span>Nights</span>
              <input type="number" min={1} max={30} value={nights} onChange={(e) => setNights(Number(e.target.value))} />
            </label>
            <label className="field">
              <span>Guests</span>
              <input type="number" min={1} max={8} value={guests} onChange={(e) => setGuests(Number(e.target.value))} />
            </label>
            <div className="formActions">
              <button className="btn" onClick={runSearch} disabled={loading}>
                {loading ? "Searching…" : "Search hotels"}
              </button>
            </div>
          </div>
        )}

        {error ? <div className="alert bad">{error}</div> : null}
      </section>

      <section className="grid2">
        <div className="card">
          <div className="cardTitle">Results</div>
          <div className="muted">Select an offer to book. Sorted by price.</div>
          <div className="spacer" />

          {offers.length === 0 ? (
            <div className="empty">Run a search to see results.</div>
          ) : (
            <div className="list">
              {offers.map((o) => (
                <button
                  key={o.offerId}
                  className={selectedOffer?.offerId === o.offerId ? "listRow active" : "listRow"}
                  onClick={() => setSelectedOffer(o)}
                >
                  <div className="listMain">
                    {o.kind === "flight" ? (
                      <>
                        <div className="listTitle">
                          {(o as FlightOffer).from} → {(o as FlightOffer).to} • {(o as FlightOffer).airline}{" "}
                          {(o as FlightOffer).flightNumber}
                        </div>
                        <div className="listMeta">
                          {(o as FlightOffer).departDate} • {(o as FlightOffer).departTime}–{(o as FlightOffer).arriveTime} •{" "}
                          {minutesToDuration((o as FlightOffer).durationMinutes)} • {(o as FlightOffer).stops} stops •{" "}
                          {o.provider}
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="listTitle">
                          {(o as HotelOffer).hotelName} • {(o as HotelOffer).city}
                        </div>
                        <div className="listMeta">
                          {(o as HotelOffer).rating}★ • {(o as HotelOffer).nights} nights • {o.provider}
                        </div>
                      </>
                    )}
                  </div>
                  <div className="listPrice">{money(o.price.total, o.price.currency)}</div>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="card">
          <div className="cardTitle">Book selected</div>
          <div className="muted">{selectedOffer ? title : "Pick an offer from the left."}</div>
          <div className="spacer" />

          <div className="formStack">
            <label className="field">
              <span>Passenger / Guest name</span>
              <input value={passengerName} onChange={(e) => setPassengerName(e.target.value)} />
            </label>
            <label className="field">
              <span>Email (optional)</span>
              <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@example.com" />
            </label>
            <label className="field">
              <span>Booking mode</span>
              <select value={mode} onChange={(e) => setMode(e.target.value as any)}>
                <option value="in_platform">Book inside platform</option>
                <option value="redirect">Redirect to provider (affiliate)</option>
              </select>
            </label>

            <button className="btn" onClick={bookNow} disabled={loading || !selectedOffer || passengerName.trim().length < 2}>
              {loading ? "Booking…" : "Confirm booking"}
            </button>

            {bookingResult ? <div className="alert ok">{bookingResult}</div> : null}
          </div>
        </div>
      </section>
    </div>
  );
}

