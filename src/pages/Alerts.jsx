import React, { useMemo, useState } from "react";
import {
  Plus,
  Bell,
  Building2,
  Phone,
  Mail,
  Trash2,
  Edit2,
  MoreVertical,
  AlertTriangle,
  CheckCircle,
  X,
} from "lucide-react";

const LS_KEYS = {
  configs: "firewatch.alertConfigs.v1",
  history: "firewatch.alertHistory.v1",
};

function uid() {
  return Math.random().toString(16).slice(2) + Date.now().toString(16);
}

function loadJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

function saveJSON(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function seedIfEmpty() {
  const existing = loadJSON(LS_KEYS.configs, null);
  if (existing && Array.isArray(existing) && existing.length > 0) return;

  const seeded = [
    {
      id: uid(),
      organization_name: "BC Wildfire Service",
      contact_name: "Director Sarah Chen",
      phone_number: "+1 (250) 387-1234",
      email: "alerts@gov.bc.ca",
      alert_threshold: "high",
      is_active: true,
      created_date: new Date().toISOString(),
    },
    {
      id: uid(),
      organization_name: "Alberta Wildfire",
      contact_name: "Chief Michael Thompson",
      phone_number: "+1 (780) 427-3473",
      email: "emergency@alberta.ca",
      alert_threshold: "high",
      is_active: true,
      created_date: new Date().toISOString(),
    },
    {
      id: uid(),
      organization_name: "Parks Canada Emergency",
      contact_name: "Regional Manager Kim Patel",
      phone_number: "+1 (888) 773-8888",
      email: "emergency@pc.gc.ca",
      alert_threshold: "extreme",
      is_active: true,
      created_date: new Date().toISOString(),
    },
    {
      id: uid(),
      organization_name: "Ontario Ministry Natural Resources",
      contact_name: "Fire Centre Coordinator",
      phone_number: "+1 (807) 475-1471",
      email: "firewatch@ontario.ca",
      alert_threshold: "moderate",
      is_active: true,
      created_date: new Date().toISOString(),
    },
  ];

  const seededHistory = [
    {
      id: uid(),
      created_date: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
      organization_name: "BC Wildfire Service",
      severity: "extreme",
      message:
        "EXTREME RISK: Okanagan Mountain Park, BC — elevated fire danger. Risk score: 91.",
      delivered: true,
    },
    {
      id: uid(),
      created_date: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
      organization_name: "Alberta Wildfire",
      severity: "high",
      message:
        "HIGH RISK: Wood Buffalo National Park, AB — elevated conditions. Risk score: 76.",
      delivered: true,
    },
    {
      id: uid(),
      created_date: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
      organization_name: "Parks Canada Emergency",
      severity: "high",
      message:
        "HIGH RISK: Greater Vancouver Area, BC — dry + wind. Risk score: 68.",
      delivered: true,
    },
  ];

  saveJSON(LS_KEYS.configs, seeded);
  saveJSON(LS_KEYS.history, seededHistory);
}

function prettyTime(iso) {
  try {
    const d = new Date(iso);
    return d.toLocaleString();
  } catch {
    return iso;
  }
}

function Badge({ children, tone = "slate" }) {
  const tones = {
    slate: "bg-slate-800/70 text-slate-200 border-slate-700/60",
    amber: "bg-amber-500/10 text-amber-300 border-amber-500/20",
    red: "bg-red-500/10 text-red-300 border-red-500/20",
    orange: "bg-orange-500/10 text-orange-300 border-orange-500/20",
    green: "bg-green-500/10 text-green-300 border-green-500/20",
  };
  return (
    <span
      className={`inline-flex items-center px-2 py-1 text-xs rounded-md border ${tones[tone]}`}
    >
      {children}
    </span>
  );
}

function severityTone(sev) {
  if (sev === "extreme") return "red";
  if (sev === "high") return "orange";
  return "amber";
}

function thresholdLabel(t) {
  if (t === "extreme") return "Extreme only";
  if (t === "high") return "High & above";
  return "Moderate & above";
}

function MiniMenu({ onEdit, onDelete }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="p-2 rounded-lg hover:bg-white/5 text-slate-300 hover:text-white"
        aria-label="More"
      >
        <MoreVertical className="w-4 h-4" />
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-40 rounded-xl border border-white/10 bg-slate-950 shadow-xl overflow-hidden z-50">
          <button
            onClick={() => {
              setOpen(false);
              onEdit();
            }}
            className="w-full text-left px-3 py-2 text-sm hover:bg-white/5 flex items-center gap-2"
          >
            <Edit2 className="w-4 h-4" /> Edit
          </button>
          <button
            onClick={() => {
              setOpen(false);
              onDelete();
            }}
            className="w-full text-left px-3 py-2 text-sm hover:bg-white/5 flex items-center gap-2 text-red-300"
          >
            <Trash2 className="w-4 h-4" /> Delete
          </button>
        </div>
      )}
    </div>
  );
}

function Toggle({ checked, onChange }) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className={`w-11 h-6 rounded-full border transition relative ${
        checked
          ? "bg-amber-500/70 border-amber-500/40"
          : "bg-slate-800 border-slate-700"
      }`}
      aria-label="Toggle"
    >
      <span
        className={`absolute top-0.5 transition left-0.5 w-5 h-5 rounded-full ${
          checked ? "translate-x-5 bg-black" : "translate-x-0 bg-slate-300"
        }`}
      />
    </button>
  );
}

function Modal({ open, title, children, onClose }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/60"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="relative w-full max-w-lg rounded-2xl border border-white/10 bg-slate-950 p-5 shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white font-semibold text-lg">{title}</h3>
          <button
            className="p-2 rounded-lg hover:bg-white/5 text-slate-300 hover:text-white"
            onClick={onClose}
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

function AlertItem({ alert }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-slate-900/30 p-4 flex items-start justify-between gap-4">
      <div className="space-y-1">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-white font-semibold">
            {alert.organization_name}
          </span>
          <Badge tone={severityTone(alert.severity)}>
            {alert.severity.toUpperCase()}
          </Badge>
          {alert.delivered ? (
            <Badge tone="green">DELIVERED</Badge>
          ) : (
            <Badge tone="slate">PENDING</Badge>
          )}
        </div>
        <p className="text-slate-300 text-sm">{alert.message}</p>
        <p className="text-xs text-slate-500">{prettyTime(alert.created_date)}</p>
      </div>
    </div>
  );
}

export default function Alerts() {
  const [tab, setTab] = useState("recipients");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);

  // seed once per browser
  useMemo(() => {
    if (typeof window !== "undefined") seedIfEmpty();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [configs, setConfigs] = useState(() =>
    typeof window === "undefined" ? [] : loadJSON(LS_KEYS.configs, [])
  );
  const [history, setHistory] = useState(() =>
    typeof window === "undefined" ? [] : loadJSON(LS_KEYS.history, [])
  );

  function syncConfigs(next) {
    setConfigs(next);
    saveJSON(LS_KEYS.configs, next);
  }
  function syncHistory(next) {
    setHistory(next);
    saveJSON(LS_KEYS.history, next);
  }

  function openAdd() {
    setEditing(null);
    setShowForm(true);
  }

  function openEdit(c) {
    setEditing(c);
    setShowForm(true);
  }

  function remove(id) {
    const next = configs.filter((c) => c.id !== id);
    syncConfigs(next);
  }

  function toggleActive(id, is_active) {
    const next = configs.map((c) => (c.id === id ? { ...c, is_active } : c));
    syncConfigs(next);
  }

  function upsert(data) {
    if (editing) {
      const next = configs.map((c) => (c.id === editing.id ? { ...c, ...data } : c));
      syncConfigs(next);
    } else {
      const created = {
        ...data,
        id: uid(),
        created_date: new Date().toISOString(),
      };
      syncConfigs([created, ...configs]);
    }
    setShowForm(false);
    setEditing(null);

    // optional: add a history entry when creating/editing (nice demo)
    const msg = editing
      ? `Recipient updated: ${data.organization_name}`
      : `Recipient added: ${data.organization_name}`;
    syncHistory([
      {
        id: uid(),
        created_date: new Date().toISOString(),
        organization_name: data.organization_name,
        severity: data.alert_threshold || "high",
        message: msg,
        delivered: true,
      },
      ...history,
    ]);
  }

  const sortedConfigs = [...configs].sort(
    (a, b) => new Date(b.created_date).getTime() - new Date(a.created_date).getTime()
  );
  const sortedHistory = [...history].sort(
    (a, b) => new Date(b.created_date).getTime() - new Date(a.created_date).getTime()
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Alert Management</h1>
          <p className="text-slate-500 text-sm mt-1">
            Configure SMS alerts for emergency organizations (demo mode)
          </p>
        </div>

        <button
          onClick={openAdd}
          className="inline-flex items-center justify-center px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-black font-semibold"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Recipient
        </button>
      </div>

      {/* Tabs */}
      <div className="inline-flex rounded-xl border border-white/10 bg-slate-900/30 p-1">
        <button
          onClick={() => setTab("recipients")}
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
            tab === "recipients"
              ? "bg-amber-500 text-black"
              : "text-slate-300 hover:text-white"
          }`}
        >
          Recipients
        </button>
        <button
          onClick={() => setTab("history")}
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
            tab === "history"
              ? "bg-amber-500 text-black"
              : "text-slate-300 hover:text-white"
          }`}
        >
          Alert History
        </button>
      </div>

      {/* Content */}
      {tab === "recipients" ? (
        sortedConfigs.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {sortedConfigs.map((config) => (
              <div
                key={config.id}
                className={`rounded-2xl border p-5 transition-all ${
                  config.is_active
                    ? "bg-slate-900/30 border-white/10"
                    : "bg-slate-950/40 border-white/5 opacity-70"
                }`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-2.5 rounded-xl ${
                        config.is_active ? "bg-amber-500/10" : "bg-slate-800/50"
                      }`}
                    >
                      <Building2
                        className={`w-5 h-5 ${
                          config.is_active ? "text-amber-500" : "text-slate-500"
                        }`}
                      />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white">
                        {config.organization_name}
                      </h3>
                      {config.contact_name ? (
                        <p className="text-sm text-slate-500">{config.contact_name}</p>
                      ) : null}
                    </div>
                  </div>

                  <MiniMenu
                    onEdit={() => openEdit(config)}
                    onDelete={() => remove(config.id)}
                  />
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm text-slate-400">
                    <Phone className="w-4 h-4" />
                    {config.phone_number}
                  </div>
                  {config.email ? (
                    <div className="flex items-center gap-2 text-sm text-slate-400">
                      <Mail className="w-4 h-4" />
                      {config.email}
                    </div>
                  ) : null}
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-white/5">
                  <div className="flex items-center gap-2">
                    <AlertTriangle
                      className={`w-4 h-4 ${
                        config.alert_threshold === "extreme"
                          ? "text-red-400"
                          : config.alert_threshold === "high"
                          ? "text-orange-400"
                          : "text-amber-400"
                      }`}
                    />
                    <span className="text-sm text-slate-400">
                      {thresholdLabel(config.alert_threshold)}
                    </span>
                  </div>

                  <Toggle
                    checked={!!config.is_active}
                    onChange={(checked) => toggleActive(config.id, checked)}
                  />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-white/10 bg-slate-900/30 p-12 text-center">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/10 flex items-center justify-center mx-auto mb-4">
              <Bell className="w-8 h-8 text-amber-500" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">
              No alert recipients
            </h3>
            <p className="text-slate-400 mb-6 max-w-md mx-auto">
              Add emergency organizations to receive alerts when wildfire risk levels are elevated.
            </p>
            <button
              onClick={openAdd}
              className="inline-flex items-center justify-center px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-black font-semibold"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add First Recipient
            </button>
          </div>
        )
      ) : sortedHistory.length > 0 ? (
        <div className="space-y-3">
          {sortedHistory.map((a) => (
            <AlertItem key={a.id} alert={a} />
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-white/10 bg-slate-900/30 p-12 text-center">
          <CheckCircle className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-white mb-2">No alerts sent yet</h3>
          <p className="text-slate-400">Alerts will appear here when notifications are generated.</p>
        </div>
      )}

      {/* Modal */}
      <Modal
        open={showForm}
        onClose={() => {
          setShowForm(false);
          setEditing(null);
        }}
        title={editing ? "Edit Recipient" : "Add Alert Recipient"}
      >
        <AlertConfigForm
          initialData={editing}
          onCancel={() => {
            setShowForm(false);
            setEditing(null);
          }}
          onSubmit={upsert}
        />
      </Modal>
    </div>
  );
}

function AlertConfigForm({ initialData, onSubmit, onCancel }) {
  const [form, setForm] = useState(
    initialData || {
      organization_name: "",
      contact_name: "",
      phone_number: "",
      email: "",
      alert_threshold: "high",
      is_active: true,
    }
  );

  function update(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function submit(e) {
    e.preventDefault();
    onSubmit(form);
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div>
        <label className="text-sm text-slate-300">Organization Name *</label>
        <input
          className="mt-1 w-full rounded-xl bg-slate-900/50 border border-white/10 px-3 py-2 text-white outline-none focus:border-amber-500/50"
          value={form.organization_name}
          onChange={(e) => update("organization_name", e.target.value)}
          placeholder="e.g., County Fire Department"
          required
        />
      </div>

      <div>
        <label className="text-sm text-slate-300">Contact Name</label>
        <input
          className="mt-1 w-full rounded-xl bg-slate-900/50 border border-white/10 px-3 py-2 text-white outline-none focus:border-amber-500/50"
          value={form.contact_name}
          onChange={(e) => update("contact_name", e.target.value)}
          placeholder="e.g., John Smith"
        />
      </div>

      <div>
        <label className="text-sm text-slate-300">Phone Number *</label>
        <input
          className="mt-1 w-full rounded-xl bg-slate-900/50 border border-white/10 px-3 py-2 text-white outline-none focus:border-amber-500/50"
          value={form.phone_number}
          onChange={(e) => update("phone_number", e.target.value)}
          placeholder="+1 (555) 123-4567"
          required
        />
      </div>

      <div>
        <label className="text-sm text-slate-300">Email</label>
        <input
          className="mt-1 w-full rounded-xl bg-slate-900/50 border border-white/10 px-3 py-2 text-white outline-none focus:border-amber-500/50"
          value={form.email}
          onChange={(e) => update("email", e.target.value)}
          placeholder="alert@department.gov"
        />
      </div>

      <div>
        <label className="text-sm text-slate-300">Alert Threshold</label>
        <select
          className="mt-1 w-full rounded-xl bg-slate-900/50 border border-white/10 px-3 py-2 text-white outline-none focus:border-amber-500/50"
          value={form.alert_threshold}
          onChange={(e) => update("alert_threshold", e.target.value)}
        >
          <option value="moderate">Moderate & Above</option>
          <option value="high">High & Above</option>
          <option value="extreme">Extreme Only</option>
        </select>
        <p className="text-xs text-slate-500 mt-1">
          Receive alerts when risk reaches this level or higher
        </p>
      </div>

      <div className="flex items-center justify-between pt-1">
        <label className="text-sm text-slate-300">Active</label>
        <button
          type="button"
          onClick={() => update("is_active", !form.is_active)}
          className={`w-11 h-6 rounded-full border transition relative ${
            form.is_active
              ? "bg-amber-500/70 border-amber-500/40"
              : "bg-slate-800 border-slate-700"
          }`}
        >
          <span
            className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full transition ${
              form.is_active ? "translate-x-5 bg-black" : "translate-x-0 bg-slate-300"
            }`}
          />
        </button>
      </div>

      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 rounded-xl border border-white/10 bg-transparent px-4 py-2 text-slate-200 hover:bg-white/5"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="flex-1 rounded-xl bg-amber-500 hover:bg-amber-600 px-4 py-2 font-semibold text-black"
        >
          {initialData ? "Update" : "Add Recipient"}
        </button>
      </div>
    </form>
  );
}
