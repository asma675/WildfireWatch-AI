import React from "react";
import { Link } from "react-router-dom";
import {
  Flame,
  LayoutDashboard,
  Map,
  MapPin,
  Bell,
  Shield,
  Building2,
  Heart,
} from "lucide-react";

function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}

function createPageUrl(page) {
  // matches your routes exactly
  return page === "Dashboard" ? "/" : `/${page}`;
}

export default function Layout({ children, currentPageName }) {
  const navItems = [
    { name: "Dashboard", icon: LayoutDashboard, page: "Dashboard" },
    { name: "Risk Map", icon: Map, page: "RiskMap" },
    { name: "Zones", icon: MapPin, page: "Zones" },
    { name: "Alerts", icon: Bell, page: "Alerts" },
    { name: "Safety", icon: Shield, page: "FireSafety" },
    { name: "Fire Depts", icon: Building2, page: "FireDepartments" },
    { name: "Health", icon: Heart, page: "HealthImpact" },
  ];

  return (
    <div className="min-h-screen bg-[#0f0f1a] text-white">
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0f0f1a]/95 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-500/20">
                  <Flame className="w-5 h-5 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-[#0f0f1a] animate-pulse" />
              </div>
              <div>
                <h1 className="text-lg font-semibold tracking-tight">
                  FireWatch AI
                </h1>
                <p className="text-[10px] text-slate-500 uppercase tracking-widest">
                  Early Threat Radar
                </p>
              </div>
            </div>

            <div className="hidden md:flex items-center gap-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentPageName === item.page;
                return (
                  <Link
                    key={item.page}
                    to={createPageUrl(item.page)}
                    className={cn(
                      "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                      isActive
                        ? "bg-amber-500/10 text-amber-500"
                        : "text-slate-400 hover:text-white hover:bg-white/5"
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    {item.name}
                  </Link>
                );
              })}
            </div>

            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-500/10 border border-green-500/20">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-xs text-green-400 font-medium">
                  System Active
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="md:hidden border-t border-white/5 px-2 py-2 flex gap-1 overflow-x-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPageName === item.page;
            return (
              <Link
                key={item.page}
                to={createPageUrl(item.page)}
                className={cn(
                  "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap",
                  isActive
                    ? "bg-amber-500/10 text-amber-500"
                    : "text-slate-400"
                )}
              >
                <Icon className="w-4 h-4" />
                {item.name}
              </Link>
            );
          })}
        </div>
      </nav>

      <main className="pt-28 md:pt-20 pb-10 px-4 sm:px-6 max-w-7xl mx-auto">
        {children}
      </main>
    </div>
  );
}
