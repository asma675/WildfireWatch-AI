import { MapContainer, TileLayer, CircleMarker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { zones } from "../data/zones";

export default function RiskMap() {
  return (
    <div className="h-[70vh] rounded-xl overflow-hidden">
      <MapContainer
        center={[54, -125]}
        zoom={4}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />

        {zones.map((z) => (
          <CircleMarker
            key={z.id}
            center={[z.lat, z.lng]}
            radius={14}
            pathOptions={{
              color:
                z.level === "Extreme"
                  ? "#ef4444"
                  : z.level === "High"
                  ? "#f97316"
                  : "#facc15",
            }}
          >
            <Popup>
              <strong>{z.name}</strong>
              <br />
              Risk: {z.risk}
            </Popup>
          </CircleMarker>
        ))}
      </MapContainer>
    </div>
  );
}
