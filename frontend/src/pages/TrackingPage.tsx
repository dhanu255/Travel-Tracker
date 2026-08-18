import { useEffect, useMemo, useRef, useState } from "react";
import { MapContainer, Marker, Polyline, Popup, TileLayer, useMap } from "react-leaflet";
import { trackingHistory, trackingPing } from "../lib/api";
import type { TrackingPing as Ping } from "../types";

function RecenterMap({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  return null;
}

type Geo = { lat: number; lng: number };

export default function TrackingPage() {
  const [watching, setWatching] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<Ping[]>([]);
  const watchIdRef = useRef<number | null>(null);

  const latest = useMemo(() => history[0] ?? null, [history]);
  const center = useMemo<Geo>(() => {
    if (latest) return { lat: latest.lat, lng: latest.lng };
    return { lat: 20.5937, lng: 78.9629 };
  }, [latest]);

  async function refresh() {
    setLoading(true);
    setError(null);
    try {
      const r = await trackingHistory(250);
      setHistory(r.history);
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

  useEffect(() => {
    if (!watching) {
      if (watchIdRef.current != null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
      return;
    }

    if (!("geolocation" in navigator)) {
      setError("Geolocation is not available in this browser.");
      setWatching(false);
      return;
    }

    setError(null);
    watchIdRef.current = navigator.geolocation.watchPosition(
      async (p) => {
        try {
          await trackingPing({
            lat: p.coords.latitude,
            lng: p.coords.longitude,
            accuracy: p.coords.accuracy,
            timestamp: Date.now()
          });
          await refresh();
        } catch (e: any) {
          setError(e?.message || String(e));
        }
      },
      (e) => setError(e.message),
      { enableHighAccuracy: true, maximumAge: 5_000, timeout: 10_000 }
    );

    return () => {
      if (watchIdRef.current != null) navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [watching]);

  const path = useMemo(() => {
    const pts = [...history].reverse().map((p) => [p.lat, p.lng] as [number, number]);
    return pts.length >= 2 ? pts : null;
  }, [history]);

  return (
    <div className="stack">
      <section className="pageTitle">
        <div>
          <h2>Tracking</h2>
          <div className="muted">Live location pings stored in backend + map visualization.</div>
        </div>
        <div className="row">
          <button className="btn ghost" onClick={refresh} disabled={loading}>
            Refresh
          </button>
          <button className="btn" onClick={() => setWatching((v) => !v)}>
            {watching ? "Stop tracking" : "Start tracking"}
          </button>
        </div>
      </section>

      {error ? <div className="alert bad">{error}</div> : null}

      <section className="grid2">
        <div className="card">
          <div className="cardTitle">Latest</div>
          <div className="muted">{latest ? new Date(latest.timestamp).toLocaleString() : "No pings yet."}</div>
          <div className="spacer" />
          {latest ? (
            <div className="kv">
              <div className="kvRow">
                <div className="kvKey">Lat</div>
                <div className="kvVal mono">{latest.lat.toFixed(6)}</div>
              </div>
              <div className="kvRow">
                <div className="kvKey">Lng</div>
                <div className="kvVal mono">{latest.lng.toFixed(6)}</div>
              </div>
              <div className="kvRow">
                <div className="kvKey">Accuracy</div>
                <div className="kvVal mono">{latest.accuracy ? `${Math.round(latest.accuracy)} m` : "—"}</div>
              </div>
            </div>
          ) : (
            <div className="empty">Click “Start tracking” to send pings.</div>
          )}
        </div>

        <div className="card">
          <div className="cardTitle">Map</div>
          <div className="muted">Path shows the most recent movement history.</div>
          <div className="spacer" />
          <div className="mapWrap">
            <MapContainer center={[center.lat, center.lng]} zoom={latest ? 13 : 5} style={{ height: "100%", width: "100%" }}>
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              <RecenterMap center={[center.lat, center.lng]} zoom={latest ? 13 : 5} />
              {path ? <Polyline positions={path} /> : null}
              {latest ? (
                <Marker position={[latest.lat, latest.lng]}>
                  <Popup>
                    <strong>Latest</strong>
                    <div>{new Date(latest.timestamp).toLocaleString()}</div>
                  </Popup>
                </Marker>
              ) : null}
            </MapContainer>
          </div>
        </div>
      </section>

      <section className="card">
        <div className="cardTitle">Ping history</div>
        <div className="muted">Stored on backend (latest first). Showing {history.length}.</div>
        <div className="spacer" />
        {history.length === 0 ? (
          <div className="empty">No pings recorded.</div>
        ) : (
          <div className="list">
            {history.slice(0, 25).map((p) => (
              <div key={p.id} className="placeRow">
                <div className="listMain">
                  <div className="listTitle">{new Date(p.timestamp).toLocaleTimeString()}</div>
                  <div className="listMeta">
                    {p.lat.toFixed(5)}, {p.lng.toFixed(5)} {p.accuracy ? `• ${Math.round(p.accuracy)}m` : ""}
                  </div>
                </div>
                <div className="muted mono">{p.id}</div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

