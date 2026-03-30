import { useEffect, useState } from "react";
import { health } from "../lib/api";

export default function HomePage() {
  const [apiOk, setApiOk] = useState<null | boolean>(null);
  const [apiInfo, setApiInfo] = useState<string>("");

  useEffect(() => {
    let alive = true;
    health()
      .then((r) => {
        if (!alive) return;
        setApiOk(true);
        setApiInfo(`${r.name} • ${new Date(r.time).toLocaleTimeString()}`);
      })
      .catch((e) => {
        if (!alive) return;
        setApiOk(false);
        setApiInfo(String(e?.message || e));
      });
    return () => {
      alive = false;
    };
  }, []);

  return (
    <div className="stack">
      <section className="hero">
        <div>
          <h1>Search flights & hotels across providers</h1>
          <p className="lead">
            A full-stack meta-search + booking demo inspired by Skyscanner / KAYAK: compare offers, book inside the
            platform, or redirect to a provider link.
          </p>
          <div className="pillRow">
            <span className={apiOk === true ? "pill ok" : apiOk === false ? "pill bad" : "pill"}>API</span>
            <span className="muted">{apiOk === null ? "Checking backend…" : apiInfo}</span>
          </div>
        </div>

        <div className="heroCard">
          <div className="heroCardTitle">What’s included</div>
          <ul className="checkList">
            <li>Multi-page UI (Home, Booking, Places, Tracking, History)</li>
            <li>Mock provider aggregation (flights + hotels)</li>
            <li>Booking creation + persisted booking history</li>
            <li>Location tracking with map + history</li>
          </ul>
        </div>
      </section>

      <section className="grid2">
        <div className="card">
          <div className="cardTitle">Booking</div>
          <div className="muted">Search and compare flight/hotel offers and create a booking.</div>
          <div className="spacer" />
          <a className="btn" href="/booking">
            Start searching
          </a>
        </div>
        <div className="card">
          <div className="cardTitle">Tracking</div>
          <div className="muted">Capture live browser GPS pings and visualize them on a map.</div>
          <div className="spacer" />
          <a className="btn" href="/tracking">
            Open tracking
          </a>
        </div>
      </section>
    </div>
  );
}

