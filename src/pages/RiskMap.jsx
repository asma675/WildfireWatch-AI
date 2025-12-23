import React, { useMemo, useState } from "react";
import { MapContainer, TileLayer, CircleMarker, Popup, Circle, Polyline } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import {
  Sparkles,
  Wind,
  Flame,
  Leaf,
  Clock,
  AlertTriangle,
} from "lucide-react";
import { zones as INITIAL_ZONES } from "../data/zones";

// ---------- Helpers ----------
const riskColor = (level) =>
  level === "Extreme" ? "#ef4444" :
  level === "High" ? "#f97316" :
  level === "Moderate" ? "#facc15" :
  "#22c55e";

const chipClasses = (level) =>
  level === "Extreme"
    ? "bg-red-500/15 text-red-400 ring-1 ring-red-500/30"
    : level === "High"
    ? "bg-orange-500/15 text-orange-400 ring-1 ring-orange-500/30"
    : level === "Moderate"
    ? "bg-amber-500/15 text-amber-300 ring-1 ring-amber-500/30"
    : "bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-500/30";

function clamp(n, a, b) {
  return Math.max(a, Math.min(b, n));
}

// ---------- Mock “data layers” (LinkedIn-ready) ----------
function buildLayerData(zones) {
  // Air quality: 0–500 AQI
  const airQuality = zones.map((z) => ({
    zoneId: z.id,
    aqi: clamp(Math.round(40 + z.risk * 2.2 + Math.random() * 40), 0, 500),
    pm25: clamp(Number((5 + z.risk * 0.25 + Math.random() * 6).toFixed(1)), 0, 999),
    advisory:
      z.risk >= 80 ? "Unhealthy – smoke likely" :
      z.risk >= 60 ? "Moderate – sensitive groups" :
      "Good – low particulate",
  }));

  // NDVI: 0–1 (lower = drier)
  const ndvi = zones.map((z) => ({
    zoneId: z.id,
    ndvi: clamp(Number((0.65 - z.risk * 0.004 + Math.random() * 0.06).toFixed(2)), 0, 1),
    vegetation:
      z.risk >= 80 ? "Stressed / Dry fuels" :
      z.risk >= 60 ? "Mixed condition" :
      "Healthy canopy",
  }));

  // Hotspots: random points near zones
  const hotspots = zones.flatMap((z) => {
    const n = z.risk >= 80 ? 5 : z.risk >= 60 ? 3 : 1;
    return Array.from({ length: n }).map((_, i) => ({
      id: `${z.id}-hs-${i}`,
      zoneId: z.id,
      lat: z.lat + (Math.random() - 0.5) * 1.2,
      lng: z.lng + (Math.random() - 0.5) * 1.2,
      tempC: Math.round(320 + Math.random() * 120), // “thermal anomaly”
    }));
  });

  // Past fires: simple polylines near higher risk zones
  const pastFires = zones
    .filter((z) => z.risk >= 55)
    .map((z) => ({
      id: `pf-${z.id}`,
      zoneId: z.id,
      year: 2023,
      acres: Math.round(8000 + z.risk * 260),
      path: [
        [z.lat + 0.35, z.lng - 0.55],
        [z.lat + 0.15, z.lng - 0.10],
        [z.lat - 0.25, z.lng + 0.35],
      ],
    }));

  // AI “prediction” = next 24h score trend
  const aiPred = zones.map((z) => {
    const delta = Math.round((Math.random() - 0.35) * 18); // tends to slightly increase
    const next = clamp(z.risk + delta, 1, 99);
    return {
      zoneId: z.id,
      now: z.risk,
      next24h: next,
      delta,
      confidence: clamp(Math.round(72 + Math.random() * 22), 60, 95),
      drivers: [
        z.risk >= 80 ? "Wind + Dry fuels" : z.risk >= 60 ? "Low humidity" : "Seasonal baseline",
        "Vegetation stress (NDVI)",
        "Recent heat anomalies",
      ],
    };
  });

  return { airQuality, ndvi, hotspots, pastFires, aiPred };
}

function TogglePill({ on, onClick, icon: Icon, label }) {
  return (
    <button
      onClick={onClick}
      className={[
        "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold transition ring-1",
        on
          ? "bg-amber-500 text-black ring-amber-500/40"
          : "bg-white/5 text-slate-200 ring-white/10 hover:bg-white/10",
      ].join(" ")}
      type="button"
    >
      <Icon className="h-4 w-4" />
      {label}
    </button>
  );
}

export default function RiskMap() {
  const [zones] = useState(INITIAL_ZONES);
  const [selectedId, setSelectedId] = useState(zones?.[0]?.id ?? null);

  const [showAI, setShowAI] = useState(true);
  const [showPast, setShowPast] = useState(false);
  const [showAir, setShowAir] = useState(false);
  const [showNDVI, setShowNDVI] = useState(false);
  const [showHotspots, setShowHotspots] = useState(false);

  const layers = useMemo(() => buildLayerData(zones), [zones]);
  const selected = zones.find((z) => z.id === selectedId) || zones[0];

  const selectedAir = layers.airQuality.find((x) => x.zoneId === selected?.id);
  const selectedNdvi = layers.ndvi.find((x) => x.zoneId === selected?.id);
  const selectedAi = layers.aiPred.find((x) => x.zoneId === selected?.id);
  const selectedHotspots = layers.hotspots.filter((x) => x.zoneId === selected?.id);
  const selectedPast = layers.pastFires.filter((x) => x.zoneId === selected?.id);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Risk Heat Map</h1>
          <p className="text-sm text-slate-400">{zones.length} zones monitored</p>
        </div>

        <div className="hidden md:flex items-center gap-2 text-xs text-slate-400">
          <span className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 px-3 py-1 ring-1 ring-emerald-500/20">
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            System Active
          </span>
        </div>
      </div>

      {/* Toggles */}
      <div className="flex flex-wrap gap-2">
        <TogglePill on={showAI} onClick={() => setShowAI((v) => !v)} icon={Sparkles} label="AI Predictions" />
        <TogglePill on={showPast} onClick={() => setShowPast((v) => !v)} icon={Clock} label="Past Fires" />
        <TogglePill on={showAir} onClick={() => setShowAir((v) => !v)} icon={Wind} label="Air Quality" />
        <TogglePill on={showNDVI} onClick={() => setShowNDVI((v) => !v)} icon={Leaf} label="NDVI Imagery" />
        <TogglePill on={showHotspots} onClick={() => setShowHotspots((v) => !v)} icon={Flame} label="Fire Hotspots" />
      </div>

      {/* Layout */}
      <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        {/* Map */}
        <div className="rounded-2xl overflow-hidden bg-white/5 ring-1 ring-white/10">
          <div className="h-[70vh]">
            <MapContainer center={[54, -125]} zoom={4} style={{ height: "100%", width: "100%" }}>
              <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />

              {/* Zones */}
              {zones.map((z) => (
                <React.Fragment key={z.id}>
                  <Circle
                    center={[z.lat, z.lng]}
                    radius={(z.radiusKm ?? 20) * 1000}
                    pathOptions={{
                      color: riskColor(z.level),
                      weight: selectedId === z.id ? 2 : 1,
                      opacity: selectedId === z.id ? 0.9 : 0.55,
                      fillOpacity: 0.07,
                    }}
                    eventHandlers={{
                      click: () => setSelectedId(z.id),
                    }}
                  />
                  <CircleMarker
                    center={[z.lat, z.lng]}
                    radius={14}
                    pathOptions={{
                      color: riskColor(z.level),
                      fillColor: riskColor(z.level),
                      fillOpacity: selectedId === z.id ? 0.9 : 0.55,
                      weight: 2,
                    }}
                    eventHandlers={{
                      click: () => setSelectedId(z.id),
                    }}
                  >
                    <Popup>
                      <strong>{z.name}</strong>
                      <br />
                      Risk: {z.risk} • {z.level}
                    </Popup>
                  </CircleMarker>
                </React.Fragment>
              ))}

              {/* Past Fires layer */}
              {showPast &&
                layers.pastFires.map((pf) => (
                  <Polyline
                    key={pf.id}
                    positions={pf.path}
                    pathOptions={{ color: "#60a5fa", weight: 3, opacity: 0.7 }}
                  />
                ))}

              {/* Hotspots layer */}
              {showHotspots &&
                layers.hotspots.map((hs) => (
                  <CircleMarker
                    key={hs.id}
                    center={[hs.lat, hs.lng]}
                    radius={6}
                    pathOptions={{ color: "#fb7185", fillColor: "#fb7185", fillOpacity: 0.85, weight: 1 }}
                  >
                    <Popup>
                      <strong>Thermal hotspot</strong>
                      <br />
                      Temp anomaly: ~{hs.tempC}K
                    </Popup>
                  </CircleMarker>
                ))}
            </MapContainer>
          </div>

          {/* Legend */}
          <div className="p-4 border-t border-white/5">
            <div className="text-xs text-slate-400 mb-2 font-semibold">RISK LEVELS</div>
            <div className="flex flex-wrap gap-3 text-sm">
              {["Extreme", "High", "Moderate", "Low"].map((lvl) => (
                <div key={lvl} className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ background: riskColor(lvl) }} />
                  <span className="text-slate-300">{lvl}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Side panel */}
        <div className="rounded-2xl bg-white/5 ring-1 ring-white/10 p-5">
          {!selected ? (
            <div className="text-slate-400">Select a zone to view analysis.</div>
          ) : (
            <div className="space-y-4">
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-semibold">{selected.name}</h2>
                    <p className="text-xs text-slate-400">
                      {selected.lat.toFixed(4)}, {selected.lng.toFixed(4)} • {selected.radiusKm ?? 20} km radius
                    </p>
                  </div>
                  <span className={`rounded-full px-2 py-1 text-[10px] font-bold uppercase ${chipClasses(selected.level)}`}>
                    {selected.level}
                  </span>
                </div>

                <div className="mt-3 grid grid-cols-2 gap-3">
                  <div className="rounded-xl bg-black/20 p-3 ring-1 ring-white/10">
                    <p className="text-xs text-slate-400">Current Risk</p>
                    <p className="text-2xl font-semibold">{selected.risk}</p>
                  </div>
                  <div className="rounded-xl bg-black/20 p-3 ring-1 ring-white/10">
                    <p className="text-xs text-slate-400">Alert Level</p>
                    <p className="text-2xl font-semibold">{selected.level}</p>
                  </div>
                </div>
              </div>

              {showAI && selectedAi && (
                <div className="rounded-2xl bg-black/20 p-4 ring-1 ring-white/10">
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="h-4 w-4 text-amber-400" />
                    <p className="font-semibold">AI Prediction (next 24h)</p>
                  </div>
                  <div className="flex items-end justify-between">
                    <div>
                      <p className="text-sm text-slate-300">
                        {selectedAi.now} →{" "}
                        <span className="font-semibold">{selectedAi.next24h}</span>{" "}
                        <span className="text-slate-400">
                          ({selectedAi.delta >= 0 ? "+" : ""}{selectedAi.delta})
                        </span>
                      </p>
                      <p className="text-xs text-slate-400 mt-1">
                        Confidence: {selectedAi.confidence}%
                      </p>
                    </div>
                    <div className="text-xs text-slate-400 text-right">
                      Drivers:
                      <div className="mt-1 space-y-1">
                        {selectedAi.drivers.map((d, i) => (
                          <div key={i} className="flex items-start gap-2 justify-end">
                            <span className="mt-1 h-1.5 w-1.5 rounded-full bg-amber-400/70" />
                            <span>{d}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {showAir && selectedAir && (
                <div className="rounded-2xl bg-black/20 p-4 ring-1 ring-white/10">
                  <div className="flex items-center gap-2 mb-2">
                    <Wind className="h-4 w-4 text-sky-400" />
                    <p className="font-semibold">Air Quality</p>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="rounded-xl bg-white/5 p-3 ring-1 ring-white/10">
                      <p className="text-xs text-slate-400">AQI</p>
                      <p className="text-lg font-semibold">{selectedAir.aqi}</p>
                    </div>
                    <div className="rounded-xl bg-white/5 p-3 ring-1 ring-white/10">
                      <p className="text-xs text-slate-400">PM2.5</p>
                      <p className="text-lg font-semibold">{selectedAir.pm25}</p>
                    </div>
                    <div className="rounded-xl bg-white/5 p-3 ring-1 ring-white/10">
                      <p className="text-xs text-slate-400">Advisory</p>
                      <p className="text-sm font-semibold">{selectedAir.advisory}</p>
                    </div>
                  </div>
                </div>
              )}

              {showNDVI && selectedNdvi && (
                <div className="rounded-2xl bg-black/20 p-4 ring-1 ring-white/10">
                  <div className="flex items-center gap-2 mb-2">
                    <Leaf className="h-4 w-4 text-emerald-400" />
                    <p className="font-semibold">NDVI Vegetation Health</p>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-300">
                        NDVI: <span className="font-semibold">{selectedNdvi.ndvi}</span>
                      </p>
                      <p className="text-xs text-slate-400 mt-1">{selectedNdvi.vegetation}</p>
                    </div>
                    <div className="w-40">
                      <div className="h-2 rounded-full bg-gradient-to-r from-red-500 via-amber-400 to-emerald-400 opacity-80" />
                      <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                        <span>dry</span><span>healthy</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {showHotspots && (
                <div className="rounded-2xl bg-black/20 p-4 ring-1 ring-white/10">
                  <div className="flex items-center gap-2 mb-2">
                    <Flame className="h-4 w-4 text-rose-400" />
                    <p className="font-semibold">Fire Hotspots</p>
                  </div>
                  {selectedHotspots.length === 0 ? (
                    <p className="text-sm text-slate-400">No thermal anomalies detected near this zone.</p>
                  ) : (
                    <div className="space-y-2">
                      {selectedHotspots.slice(0, 5).map((hs) => (
                        <div key={hs.id} className="flex items-center justify-between rounded-xl bg-white/5 p-3 ring-1 ring-white/10">
                          <p className="text-sm text-slate-200">
                            ~{hs.tempC}K anomaly
                          </p>
                          <p className="text-xs text-slate-400">
                            {hs.lat.toFixed(3)}, {hs.lng.toFixed(3)}
                          </p>
                        </div>
                      ))}
                      {selectedHotspots.length > 5 && (
                        <p className="text-xs text-slate-400">
                          +{selectedHotspots.length - 5} more hotspots on map
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )}

              {showPast && (
                <div className="rounded-2xl bg-black/20 p-4 ring-1 ring-white/10">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="h-4 w-4 text-blue-400" />
                    <p className="font-semibold">Past Fire Footprints</p>
                  </div>
                  {selectedPast.length === 0 ? (
                    <p className="text-sm text-slate-400">No historical footprints near this zone.</p>
                  ) : (
                    <div className="space-y-2">
                      {selectedPast.map((pf) => (
                        <div key={pf.id} className="flex items-center justify-between rounded-xl bg-white/5 p-3 ring-1 ring-white/10">
                          <p className="text-sm text-slate-200">
                            {pf.year} • ~{pf.acres.toLocaleString()} acres
                          </p>
                          <span className="text-xs text-slate-400">polyline</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {selected.risk >= 80 && (
                <div className="rounded-2xl bg-red-500/10 p-4 ring-1 ring-red-500/20">
                  <div className="flex items-center gap-2 mb-1">
                    <AlertTriangle className="h-4 w-4 text-red-400" />
                    <p className="font-semibold text-red-300">Action Needed</p>
                  </div>
                  <p className="text-sm text-slate-200">
                    High probability of rapid spread conditions. Recommend restricting activity and monitoring alerts.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
