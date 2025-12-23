import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Flame, AlertTriangle, TrendingUp, Plus, Map as MapIcon } from "lucide-react";
import { zones as ZONES } from "../data/zones";

function riskLevelToColor(level) {
  if (level === "Extreme") return "text-red-400";
  if (level === "High") return "text-orange-400";
  if (level === "Moderate") return "text-amber-300";
  return "text-green-400";
}

function riskLevelToRing(level) {
  if (level === "Extreme") return "ring-red-500/30";
  if (level === "High") return "ring-orange-500/30";
  if (level === "Moderate") return "ring-amber-500/30";
  return "ring-green-500/30";
}

function riskLevelToStroke(level) {
  if (level === "Extreme") return "stroke-red-500";
  if (level === "High") return "stroke-orange-500";
  if (level === "Moderate") return "stroke-amber-500";
  return "stroke-green-500";
}

function RiskRing({ value = 0, level = "Low" }) {
  const radius = 28;
  const circumference = 2 * Math.PI * radius;
  const pct = Math.max(0, Math.min(100, value));
  const dash = (pct / 100) * circumference;

  return (
    <svg width="76" height="76" viewBox="0 0 76 76" className="shrink-0">
      <circle
        cx="38"
        cy="38"
        r={radius}
        fill="none"
        stroke="rgba(255,255,255,0.08)"
        strokeWidth="8"
      />
      <circle
        cx="38"
        cy="38"
        r={radius}
        fill="none"
        strokeWidth="8"
        className={riskLevelToStroke(level)}
        strokeLinecap="round"
        strokeDasharray={`${dash} ${circumference}`}
        transform="rotate(-90 38 38)"
      />
      <text
        x="38"
        y="40"
        textAnchor="middle"
        className="fill-white font-semibold"
        fontSize="16"
      >
        {pct}
      </text>
      <text
        x="38"
        y="56"
        textAnchor="middle"
        className="fill-slate-400 uppercase"
        fontSize="9"
      >
        {level}
      </text>
    </svg>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();

  const stats = useMemo(() => {
    const monitored = ZONES.length;
    const extreme = ZONES.filter((z) => z.level === "Extreme").length;
    const high = ZONES.filter((z) => z.level === "High").length;
    const avg = monitored
      ? Math.round(ZONES.reduce((a, z) => a + (z.risk || 0), 0) / monitored)
      : 0;

    // “recent alerts” mock that looks like your screenshot
    const recentAlerts = ZONES
      .slice()
      .sort((a, b) => (b.risk || 0) - (a.risk || 0))
      .slice(0, 3)
      .map((z, idx) => ({
        id: `${z.id}-${idx}`,
        title: z.name,
        level: z.level,
        score: z.risk,
        time: "Dec 22, 5:22 PM",
        notified: idx + 2,
      }));

    const highest = ZONES
      .slice()
      .sort((a, b) => (b.risk || 0) - (a.risk || 0))
      .slice(0, 4);

    return { monitored, extreme, high, avg, recentAlerts, highest };
  }, []);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Threat Overview</h1>
          <p className="text-sm text-slate-400">
            Real-time wildfire risk monitoring • Automated analysis active
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => navigate("/RiskMap")}
            className="inline-flex items-center gap-2 rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-black hover:bg-amber-400 transition"
          >
            <TrendingUp className="h-4 w-4" />
            Run Analysis
          </button>
          <button
            onClick={() => navigate("/Zones")}
            className="inline-flex items-center gap-2 rounded-lg bg-white/5 px-4 py-2 text-sm font-semibold text-white hover:bg-white/10 transition ring-1 ring-white/10"
          >
            <Plus className="h-4 w-4" />
            Add Zone
          </button>
        </div>
      </div>

      {/* Top Stat Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <div className="rounded-2xl bg-white/5 p-5 ring-1 ring-white/10">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-400">Monitored Zones</p>
            <MapIcon className="h-5 w-5 text-slate-300" />
          </div>
          <div className="mt-2 text-3xl font-semibold">{stats.monitored}</div>
        </div>

        <div className="rounded-2xl bg-red-500/10 p-5 ring-1 ring-red-500/20">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-300">Extreme Risk</p>
            <Flame className="h-5 w-5 text-red-400" />
          </div>
          <div className="mt-2 text-3xl font-semibold">{stats.extreme}</div>
          <p className="mt-1 text-xs text-slate-400">
            Zones requiring immediate attention
          </p>
        </div>

        <div className="rounded-2xl bg-orange-500/10 p-5 ring-1 ring-orange-500/20">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-300">High Risk</p>
            <AlertTriangle className="h-5 w-5 text-orange-400" />
          </div>
          <div className="mt-2 text-3xl font-semibold">{stats.high}</div>
        </div>

        <div className="rounded-2xl bg-emerald-500/10 p-5 ring-1 ring-emerald-500/20">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-300">Avg Risk Score</p>
            <TrendingUp className="h-5 w-5 text-emerald-400" />
          </div>
          <div className="mt-2 text-3xl font-semibold">{stats.avg}</div>
        </div>
      </div>

      {/* Highest Risk + Recent Alerts */}
      <div className="grid gap-4 lg:grid-cols-3">
        {/* Highest Risk Zones */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold">Highest Risk Zones</h2>
            <button
              onClick={() => navigate("/RiskMap")}
              className="text-sm font-semibold text-amber-400 hover:text-amber-300 transition"
            >
              View Map →
            </button>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {stats.highest.map((z) => (
              <div
                key={z.id}
                className={`rounded-2xl bg-white/5 p-5 ring-1 ring-white/10 hover:ring-2 ${riskLevelToRing(
                  z.level
                )} transition cursor-pointer`}
                onClick={() => navigate("/RiskMap")}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold">{z.name}</p>
                    <p className="mt-1 text-xs text-slate-400">
                      {z.lat.toFixed(4)}, {z.lng.toFixed(4)}
                    </p>
                    <p className={`mt-2 text-xs font-semibold ${riskLevelToColor(z.level)}`}>
                      {z.level.toUpperCase()} RISK
                    </p>
                  </div>
                  <RiskRing value={z.risk} level={z.level} />
                </div>
                <p className="mt-3 text-xs text-slate-400 line-clamp-2">
                  {z.level === "Extreme"
                    ? "Critical fire danger with low humidity and strong winds. Immediate monitoring recommended."
                    : z.level === "High"
                    ? "Elevated fire danger. Watch local advisories and avoid high-risk activity."
                    : "Moderate seasonal risk. Stay prepared and monitor changes in conditions."}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Alerts */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold">Recent Alerts</h2>
            <button
              onClick={() => navigate("/Alerts")}
              className="text-sm font-semibold text-amber-400 hover:text-amber-300 transition"
            >
              View All →
            </button>
          </div>

          <div className="space-y-4">
            {stats.recentAlerts.map((a) => (
              <div
                key={a.id}
                className="rounded-2xl bg-white/5 p-4 ring-1 ring-white/10 hover:bg-white/10 transition cursor-pointer"
                onClick={() => navigate("/RiskMap")}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold">{a.title}</p>
                    <p className="mt-1 text-xs text-slate-400">
                      Risk score: {a.score}
                    </p>
                  </div>
                  <span
                    className={`rounded-full px-2 py-1 text-[10px] font-bold uppercase ${
                      a.level === "Extreme"
                        ? "bg-red-500/15 text-red-400 ring-1 ring-red-500/30"
                        : a.level === "High"
                        ? "bg-orange-500/15 text-orange-400 ring-1 ring-orange-500/30"
                        : "bg-amber-500/15 text-amber-300 ring-1 ring-amber-500/30"
                    }`}
                  >
                    {a.level}
                  </span>
                </div>

                <div className="mt-3 flex items-center justify-between text-xs text-slate-400">
                  <span>{a.time}</span>
                  <span className="text-emerald-400 font-semibold">
                    ✓ {a.notified} notified
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer status strip (like your screenshot) */}
      <div className="rounded-2xl bg-white/5 p-4 ring-1 ring-white/10 flex items-center justify-between">
        <div>
          <p className="font-semibold">Backend Functions Active</p>
          <p className="text-xs text-slate-400">
            Auto-analysis • Alert dispatch • Air quality monitoring • Heat map generation
          </p>
        </div>
        <div className="flex items-center gap-2 text-emerald-400 font-semibold text-sm">
          <span className="h-2 w-2 rounded-full bg-emerald-400" />
          All Systems Operational
        </div>
      </div>
    </div>
  );
}
