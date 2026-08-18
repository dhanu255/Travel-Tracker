import { useEffect, useMemo, useState } from "react";
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import { getPlaces } from "../lib/api";
import type { TravelPlace } from "../types";

function RecenterMap({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  return null;
}

type Geo = { lat: number; lng: number };

function haversineKm(a: Geo, b: Geo) {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const lat1 = (a.lat * Math.PI) / 180;
  const lat2 = (b.lat * Math.PI) / 180;
  const x =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLng / 2) * Math.sin(dLng / 2) * Math.cos(lat1) * Math.cos(lat2);
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(x)));
}

export default function PlacesPage() {
  const [places, setPlaces] = useState<TravelPlace[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const [userPos, setUserPos] = useState<Geo | null>(null);
  const [watching, setWatching] = useState(false);

  useEffect(() => {
    getPlaces()
      .then((r) => setPlaces(r.places))
      .catch((e) => setError(e?.message || String(e)))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!watching) return;
    if (!("geolocation" in navigator)) {
      setError("Geolocation is not available in this browser.");
      setWatching(false);
      return;
    }
    const id = navigator.geolocation.watchPosition(
      (p) => setUserPos({ lat: p.coords.latitude, lng: p.coords.longitude }),
      (e) => setError(e.message),
      { enableHighAccuracy: true, maximumAge: 10_000, timeout: 10_000 }
    );
    return () => navigator.geolocation.clearWatch(id);
  }, [watching]);

  const center = useMemo(() => {
    if (userPos) return userPos;
    if (places[0]) return { lat: places[0].lat, lng: places[0].lng };
    return { lat: 20.5937, lng: 78.9629 };
  }, [places, userPos]);

  const computed = useMemo(() => {
    if (!userPos) return places.map((p) => ({ ...p, distanceKm: null as null | number }));
    return places
      .map((p) => ({ ...p, distanceKm: haversineKm(userPos, { lat: p.lat, lng: p.lng }) }))
      .sort((a, b) => (a.distanceKm ?? 1e9) - (b.distanceKm ?? 1e9));
  }, [places, userPos]);

  return (
    <div className="stack">
      <section className="pageTitle">
        <div>
          <h2>Travel Place Location Monitoring</h2>
          <div className="muted">Map view + distance-to-place using live browser location.</div>
        </div>
        <div className="row">
          <button className="btn ghost" onClick={() => setWatching((v) => !v)}>
            {watching ? "Stop live location" : "Start live location"}
          </button>
        </div>
      </section>

      {error ? <div className="alert bad">{error}</div> : null}

      <section className="grid2">
        <div className="card">
          <div className="cardTitle">Places</div>
          <div className="muted">{loading ? "Loading…" : userPos ? "Sorted by nearest" : "Enable live location to sort"}</div>
          <div className="spacer" />

          {computed.length === 0 ? (
            <div className="empty">No places loaded.</div>
          ) : (
            <div className="list">
              {computed.map((p) => (
                <div key={p.id} className="placeRow">
                  <div className="listMain">
                    <div className="listTitle">{p.name}</div>
                    <div className="listMeta">
                      {p.city}, {p.country} • {p.tags.join(", ")}
                      {p.distanceKm != null ? ` • ${p.distanceKm.toFixed(1)} km away` : ""}
                    </div>
                  </div>
                  <div className="muted mono">
                    {p.lat.toFixed(4)}, {p.lng.toFixed(4)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card">
          <div className="cardTitle">Map</div>
          <div className="muted">OpenStreetMap tiles. Your live location appears when enabled.</div>
          <div className="spacer" />

          <div className="mapWrap">
            <MapContainer center={[center.lat, center.lng]} zoom={userPos ? 6 : 5} style={{ height: "100%", width: "100%" }}>
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              <RecenterMap center={[center.lat, center.lng]} zoom={userPos ? 6 : 5} />
              {computed.map((p) => (
                <Marker key={p.id} position={[p.lat, p.lng]}>
                  <Popup>
                    <strong>{p.name}</strong>
                    <div>
                      {p.city}, {p.country}
                    </div>
                  </Popup>
                </Marker>
              ))}
              {userPos ? (
                <Marker position={[userPos.lat, userPos.lng]}>
                  <Popup>
                    <strong>You</strong>
                    <div>
                      {userPos.lat.toFixed(5)}, {userPos.lng.toFixed(5)}
                    </div>
                  </Popup>
                </Marker>
              ) : null}
            </MapContainer>
          </div>
        </div>
      </section>
    </div>
  );
}

