import React, { useMemo, useState } from "react";
import { Plus, MapPin, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { zones as INITIAL_ZONES } from "../data/zones";

function levelChip(level) {
  if (level === "Extreme")
    return "bg-red-500/15 text-red-400 ring-1 ring-red-500/30";
  if (level === "High")
    return "bg-orange-500/15 text-orange-400 ring-1 ring-orange-500/30";
  if (level === "Moderate")
    return "bg-amber-500/15 text-amber-300 ring-1 ring-amber-500/30";
  return "bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-500/30";
}

function scoreToLevel(score) {
  if (score >= 80) return "Extreme";
  if (score >= 60) return "High";
  if (score >= 35) return "Moderate";
  return "Low";
}

function riskRingClasses(level) {
  if (level === "Extreme") return "text-red-400";
  if (level === "High") return "text-orange-400";
  if (level === "Moderate") return "text-amber-300";
  return "text-emerald-300";
}

function RiskMiniRing({ score, level }) {
  const radius = 22;
  const circumference = 2 * Math.PI * radius;
  const pct = Math.max(0, Math.min(100, score));
  const dash = (pct / 100) * circumference;

  return (
    <svg width="64" height="64" viewBox="0 0 64 64" className="shrink-0">
      <circle
        cx="32"
        cy="32"
        r={radius}
        fill="none"
        stroke="rgba(255,255,255,0.08)"
        strokeWidth="7"
      />
      <circle
        cx="32"
        cy="32"
        r={radius}
        fill="none"
        strokeWidth="7"
        className={riskRingClasses(level)}
        strokeLinecap="round"
        strokeDasharray={`${dash} ${circumference}`}
        transform="rotate(-90 32 32)"
      />
      <text x="32" y="35" textAnchor="middle" className="fill-white font-semibold" fontSize="14">
        {pct}
      </text>
      <text x="32" y="50" textAnchor="middle" className="fill-slate-400 uppercase" fontSize="9">
        {level}
      </text>
    </svg>
  );
}

export default function Zones() {
  const navigate = useNavigate();
  const [zones, setZones] = useState(INITIAL_ZONES);
  const [open, setOpen] = useState(false);

  // form state
  const [name, setName] = useState("");
  const [lat, setLat] = useState("49.2827");
  const [lng, setLng] = useState("-123.1207");
  const [radiusKm, setRadiusKm] = useState(20);

  const derived = useMemo(() => {
    return zones
      .map((z) => ({
        ...z,
        // simple “conditions” placeholders (so UI looks right)
        temp: z.level === "Extreme" ? "38°F" : z.level === "High" ? "34°F" : "26°F",
        wind: z.level === "Extreme" ? "32 mph" : z.level === "High" ? "18 mph" : "15 mph",
        ndvi: z.level === "Extreme" ? "0.21" : z.level === "High" ? "0.34" : "0.48",
      }))
      .sort((a, b) => (b.risk || 0) - (a.risk || 0));
  }, [zones]);

  function resetForm() {
    setName("");
    setLat("49.2827");
    setLng("-123.1207");
    setRadiusKm(20);
  }

  function addZone() {
    const parsedLat = Number(lat);
    const parsedLng = Number(lng);

    if (!name.trim() || Number.isNaN(parsedLat) || Number.isNaN(parsedLng)) return;

    // lightweight risk calc (so it’s not “missing”)
    const pseudoRisk = Math.max(
      5,
      Math.min(95, Math.round(30 + Math.random() * 55))
    );
    const level = scoreToLevel(pseudoRisk);

    setZones((prev) => [
      ...prev,
      {
        id: Date.now(),
        name: name.trim(),
        lat: parsedLat,
        lng: parsedLng,
        risk: pseudoRisk,
        level,
        radiusKm,
      },
    ]);

    setOpen(false);
    resetForm();
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Monitored Zones</h1>
          <p className="text-sm text-slate-400">
            Add and manage geographic areas for wildfire monitoring
          </p>
        </div>

        <button
          onClick={() => setOpen(true)}
          className="inline-flex items-center gap-2 rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-black hover:bg-amber-400 transition"
        >
          <Plus className="h-4 w-4" />
          Add Zone
        </button>
      </div>

      {/* Grid */}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {derived.map((z) => (
          <div
            key={z.id}
            className="rounded-2xl bg-white/5 p-5 ring-1 ring-white/10 hover:bg-white/10 transition cursor-pointer"
            onClick={() => navigate("/RiskMap")}
            title="Click to view on Risk Map"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-slate-400" />
                  <p className="font-semibold">{z.name}</p>
                </div>
                <p className="mt-1 text-xs text-slate-400">
                  {z.lat.toFixed(4)}, {z.lng.toFixed(4)} • {z.radiusKm ?? 20} km radius
                </p>

                <div className="mt-3 flex gap-2 text-xs text-slate-400">
                  <span>🌡 {z.temp}</span>
                  <span>💨 {z.wind}</span>
                  <span>🌿 {z.ndvi} NDVI</span>
                </div>

                <p className="mt-3 text-xs text-slate-400 line-clamp-2">
                  {z.level === "Extreme"
                    ? "Critical fire danger with drought conditions and strong winds."
                    : z.level === "High"
                    ? "High risk for interface areas. Monitor advisories and restrict activity."
                    : "Moderate risk with seasonal conditions. Stay prepared and track changes."}
                </p>
              </div>

              <div className="flex flex-col items-end gap-2">
                <span className={`rounded-full px-2 py-1 text-[10px] font-bold uppercase ${levelChip(z.level)}`}>
                  {z.level}
                </span>
                <RiskMiniRing score={z.risk} level={z.level} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {open && (
        <div className="fixed inset-0 z-[100] bg-black/60 flex items-center justify-center px-4">
          <div className="w-full max-w-lg rounded-2xl bg-[#0b1220] ring-1 ring-white/10 p-5">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Add New Zone</h2>
              <button
                onClick={() => {
                  setOpen(false);
                  resetForm();
                }}
                className="p-2 rounded-lg hover:bg-white/5"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-4 space-y-3">
              <div>
                <label className="text-xs text-slate-400">Zone Name</label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., Northern California Forest"
                  className="mt-1 w-full rounded-lg bg-white/5 ring-1 ring-white/10 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-amber-500/40"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-400">Latitude</label>
                  <input
                    value={lat}
                    onChange={(e) => setLat(e.target.value)}
                    className="mt-1 w-full rounded-lg bg-white/5 ring-1 ring-white/10 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-amber-500/40"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400">Longitude</label>
                  <input
                    value={lng}
                    onChange={(e) => setLng(e.target.value)}
                    className="mt-1 w-full rounded-lg bg-white/5 ring-1 ring-white/10 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-amber-500/40"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-400">
                  Monitoring Radius: <span className="text-slate-200 font-semibold">{radiusKm} km</span>
                </label>
                <input
                  type="range"
                  min="5"
                  max="80"
                  value={radiusKm}
                  onChange={(e) => setRadiusKm(Number(e.target.value))}
                  className="mt-2 w-full"
                />
                <p className="mt-1 text-[11px] text-slate-500">
                  Area covered: ~{Math.round(Math.PI * radiusKm * radiusKm)} km²
                </p>
              </div>
            </div>

            <div className="mt-5 flex justify-end gap-3">
              <button
                onClick={() => {
                  setOpen(false);
                  resetForm();
                }}
                className="rounded-lg bg-white/5 ring-1 ring-white/10 px-4 py-2 text-sm font-semibold hover:bg-white/10"
              >
                Cancel
              </button>
              <button
                onClick={addZone}
                className="rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-black hover:bg-amber-400"
              >
                Add Zone
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
