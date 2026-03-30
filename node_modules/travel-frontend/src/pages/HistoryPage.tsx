import { useEffect, useState } from "react";
import { listBookings } from "../lib/api";
import type { Booking } from "../types";
import { minutesToDuration, money, niceDate } from "../lib/format";

export default function HistoryPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function refresh() {
    setLoading(true);
    setError(null);
    try {
      const r = await listBookings();
      setBookings(r.bookings);
    } catch (e: any) {
      setError(e?.message || String(e));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="stack">
      <section className="pageTitle">
        <div>
          <h2>Booking History</h2>
          <div className="muted">All bookings saved in backend storage.</div>
        </div>
        <div className="row">
          <button className="btn ghost" onClick={refresh} disabled={loading}>
            Refresh
          </button>
        </div>
      </section>

      {error ? <div className="alert bad">{error}</div> : null}

      <section className="card">
        <div className="cardTitle">Bookings</div>
        <div className="muted">{loading ? "Loading…" : `${bookings.length} total`}</div>
        <div className="spacer" />

        {bookings.length === 0 ? (
          <div className="empty">No bookings yet. Create one from the Booking page.</div>
        ) : (
          <div className="list">
            {bookings.map((b) => (
              <div key={b.bookingId} className="historyRow">
                <div className="listMain">
                  <div className="listTitle">
                    {b.offer.kind === "flight"
                      ? `${b.offer.from} → ${b.offer.to} • ${b.offer.airline} ${b.offer.flightNumber}`
                      : `${b.offer.hotelName} • ${b.offer.city}`}
                  </div>
                  <div className="listMeta">
                    {b.offer.kind === "flight"
                      ? `${b.offer.departDate} • ${b.offer.departTime}–${b.offer.arriveTime} • ${minutesToDuration(
                          b.offer.durationMinutes
                        )} • ${b.offer.provider}`
                      : `${b.offer.rating}★ • ${b.offer.nights} nights • ${b.offer.provider}`}
                    {" • "}
                    {niceDate(b.createdAt)}
                    {" • "}
                    {b.mode === "redirect" ? "Redirect" : "In-platform"}
                  </div>
                </div>
                <div className="historyRight">
                  <div className="listPrice">{money(b.offer.price.total, b.offer.price.currency)}</div>
                  <div className={b.status === "confirmed" ? "status ok" : "status"}>{b.status}</div>
                  <div className="muted mono">{b.bookingId}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

