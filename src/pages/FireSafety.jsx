import React from "react";
import {
  Shield,
  AlertTriangle,
  Home,
  Users,
  Phone,
  MapPin,
  ExternalLink,
} from "lucide-react";

/**
 * Zero-dependency "Card" components so Vercel/Vite won't fail
 * even if shadcn/ui isn't installed or @ alias isn't configured.
 */
function Card({ className = "", children }) {
  return (
    <div className={`rounded-2xl border border-white/10 ${className}`}>
      {children}
    </div>
  );
}
function CardHeader({ children, className = "" }) {
  return <div className={`p-5 pb-3 ${className}`}>{children}</div>;
}
function CardTitle({ children, className = "" }) {
  return (
    <h3 className={`text-lg font-semibold ${className}`}>{children}</h3>
  );
}
function CardContent({ children, className = "" }) {
  return <div className={`p-5 pt-0 ${className}`}>{children}</div>;
}

export default function FireSafety() {
  const beforeSteps = [
    {
      icon: Home,
      title: "Create Defensible Space",
      desc: "Clear vegetation 30+ meters from your home",
    },
    {
      icon: MapPin,
      title: "Know Evacuation Routes",
      desc: "Plan multiple routes and meeting locations",
    },
    {
      icon: Users,
      title: "Prepare Emergency Kit",
      desc: "Water, food, medications, documents for 72 hours",
    },
    {
      icon: Phone,
      title: "Emergency Contacts",
      desc: "Keep list of local fire departments and family",
    },
  ];

  const duringSteps = [
    "Monitor local news and emergency alerts constantly",
    "Close all windows, doors, and vents to prevent embers",
    "Turn on all exterior lights for visibility in smoke",
    "Move flammable furniture away from windows",
    "Fill bathtubs, sinks with water for emergency use",
    "Evacuate immediately when ordered - don't wait",
  ];

  const afterSteps = [
    "Wait for official clearance before returning home",
    "Watch for hot spots and smoldering materials",
    "Document damage with photos for insurance",
    "Wear protective gear when cleaning ash and debris",
    "Check air quality before extended outdoor exposure",
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-3 rounded-xl bg-red-500/10">
          <Shield className="w-6 h-6 text-red-500" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">
            Wildfire Safety Guide
          </h1>
          <p className="text-slate-400">
            Critical information to protect yourself and your family
          </p>
        </div>
      </div>

      {/* Emergency Numbers */}
      <Card className="bg-red-500/10 border-red-500/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-400">
            <AlertTriangle className="w-5 h-5" />
            Emergency Contacts
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex items-center justify-between p-3 bg-slate-900/50 rounded-lg">
            <span className="text-slate-300">Emergency Services</span>
            <a href="tel:911" className="text-2xl font-bold text-red-400">
              911
            </a>
          </div>
          <div className="flex items-center justify-between p-3 bg-slate-900/50 rounded-lg">
            <span className="text-slate-300">Fire Information Line</span>
            <span className="font-semibold text-slate-200">
              1-888-336-7378
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Before a Fire */}
      <Card className="bg-slate-800/50 border-white/10">
        <CardHeader>
          <CardTitle className="text-white">Before a Wildfire</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-2 gap-4">
            {beforeSteps.map((step, idx) => {
              const Icon = step.icon;
              return (
                <div
                  key={idx}
                  className="flex gap-3 p-4 bg-slate-900/50 rounded-lg"
                >
                  <div className="p-2 rounded-lg bg-amber-500/10 h-fit">
                    <Icon className="w-5 h-5 text-amber-500" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-white mb-1">
                      {step.title}
                    </h4>
                    <p className="text-sm text-slate-400">{step.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* During a Fire */}
      <Card className="bg-slate-800/50 border-white/10">
        <CardHeader>
          <CardTitle className="text-white">During a Wildfire</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3">
            {duringSteps.map((step, idx) => (
              <li key={idx} className="flex gap-3 items-start">
                <div className="w-6 h-6 rounded-full bg-orange-500/20 text-orange-400 flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">
                  {idx + 1}
                </div>
                <span className="text-slate-300">{step}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* After a Fire */}
      <Card className="bg-slate-800/50 border-white/10">
        <CardHeader>
          <CardTitle className="text-white">After a Wildfire</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3">
            {afterSteps.map((step, idx) => (
              <li key={idx} className="flex gap-3 items-start">
                <div className="w-6 h-6 rounded-full bg-green-500/20 text-green-400 flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">
                  {idx + 1}
                </div>
                <span className="text-slate-300">{step}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Resources */}
      <Card className="bg-slate-800/50 border-white/10">
        <CardHeader>
          <CardTitle className="text-white">Additional Resources</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <a
            href="https://www.canada.ca/en/services/environment/weather/wildfire.html"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between p-3 bg-slate-900/50 rounded-lg hover:bg-slate-900/70 transition-colors group"
          >
            <span className="text-slate-300">
              Government of Canada - Wildfires
            </span>
            <ExternalLink className="w-4 h-4 text-slate-500 group-hover:text-amber-500" />
          </a>

          <a
            href="https://www.redcross.ca/how-we-help/emergencies-and-disasters-in-canada/types-of-emergencies/wildfires"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between p-3 bg-slate-900/50 rounded-lg hover:bg-slate-900/70 transition-colors group"
          >
            <span className="text-slate-300">
              Canadian Red Cross - Wildfire Safety
            </span>
            <ExternalLink className="w-4 h-4 text-slate-500 group-hover:text-amber-500" />
          </a>
        </CardContent>
      </Card>
    </div>
  );
}
