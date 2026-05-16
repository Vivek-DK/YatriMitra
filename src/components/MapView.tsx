import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Route, Vehicle, Coordinate } from '../types';
import { MapPin, Navigation } from 'lucide-react';
import { useMemo, useEffect } from 'react';

// ... existing icons code ...

function MapRecenter({ center }: { center: Coordinate }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo([center.lat, center.lng], 14, { duration: 1.5 });
  }, [center, map]);
  return null;
}

// Fix Leaflet marker icon issue
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

const DefaultIcon = L.icon({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

// Custom icons for Auto, Cab, and Bike
const createVehicleIcon = (type: string, direction: number, id: string) => {
  let colorClass = 'bg-amber-500';
  let iconPath = '<path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99z"/>';
  
  if (type === 'cab') {
    colorClass = 'bg-blue-600';
    iconPath = '<path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9l-1.1-3.2c-.2-.5-.7-.9-1.2-.9H5.8c-.5 0-1 .4-1.2.9l-1.1 3.2C2.7 11.3 2 12.1 2 13v3c0 .6.4 1 1 1h2"/><circle cx="7" cy="17" r="2" fill="white"/><circle cx="17" cy="17" r="2" fill="white"/>';
  } else if (type === 'bike') {
    colorClass = 'bg-rose-500';
    iconPath = '<circle cx="5.5" cy="17.5" r="3.5" fill="white"/><circle cx="18.5" cy="17.5" r="3.5" fill="white"/><path d="M15 6a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm-3 11.5V14l-3-3 4-3 2 3h2"/>';
  }

  const shortId = id.split('-').slice(-1);
  return L.divIcon({
    className: 'vehicle-marker-container',
    html: `<div class="flex flex-col items-center">
            <div class="${colorClass} w-7 h-7 rounded-lg border border-white/40 flex items-center justify-center shadow-lg transform" style="transform: rotate(${direction > 0 ? 0 : 180}deg)">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="white">${iconPath}</svg>
            </div>
            <div class="mt-1 bg-black/60 backdrop-blur-md px-1.5 py-0.5 rounded border border-white/20 text-[8px] font-mono text-white/90 whitespace-nowrap uppercase tracking-tighter">${type.slice(0,1)}-${shortId}</div>
          </div>`,
    iconSize: [50, 40],
    iconAnchor: [25, 30]
  });
};

const stopIcon = L.divIcon({
  className: 'custom-stop-icon',
  html: `<div class="w-4 h-4 bg-emerald-500 rounded-full border-2 border-white shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>`,
  iconSize: [16, 16],
  iconAnchor: [8, 8]
});

interface MapViewProps {
  routes: Route[];
  vehicles: Vehicle[];
  center: Coordinate;
  onSelectVehicle: (v: Vehicle) => void;
  onSelectStop: (s: any) => void;
}

export default function MapView({ routes, vehicles, center, onSelectVehicle, onSelectStop }: MapViewProps) {
  return (
    <MapContainer center={[center.lat, center.lng]} zoom={14} className="w-full h-full grayscale-[0.8] contrast-[1.2]">
      <MapRecenter center={center} />
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      
      {routes.map((route) => (
        <div key={route.id}>
          <Polyline 
            positions={route.path.map(p => [p.lat, p.lng])} 
            color="#10b981" 
            weight={6} 
            opacity={0.3}
          />
          <Polyline 
            positions={route.path.map(p => [p.lat, p.lng])} 
            color="#10b981" 
            weight={2} 
            opacity={0.8}
            dashArray="10, 15"
          />
          {route.stops.map(stop => (
            <Marker 
              key={stop.id} 
              position={[stop.lat, stop.lng]} 
              icon={stopIcon}
              eventHandlers={{ click: () => onSelectStop(stop) }}
            >
              <Popup className="dark-popup">{stop.name}</Popup>
            </Marker>
          ))}
        </div>
      ))}

      {vehicles.map((v) => (
        <Marker 
          key={v.id} 
          position={[v.position.lat, v.position.lng]}
          icon={createVehicleIcon(v.type, v.direction, v.id)}
          eventHandlers={{ click: () => onSelectVehicle(v) }}
        >
          <Popup className="dark-popup">
            <div className="text-xs font-mono">
              <div className="font-bold text-emerald-400 mb-1">{v.type.toUpperCase()} UNIT #{v.id.split('-').slice(-1)}</div>
              <div className="text-slate-400 flex justify-between gap-4">SPEED: <span>{Math.round(v.speed)} KM/H</span></div>
              <div className="text-slate-400 flex justify-between gap-4">LOAD: <span>{v.occupancy}/{v.maxOccupancy}</span></div>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
