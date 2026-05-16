import { useState, useMemo } from 'react';
import MapView from './components/MapView';
import SearchBar from './components/SearchBar';
import ETADashboard from './components/ETADashboard';
import { Route, Stop, Vehicle, Coordinate, SearchResult } from './types';
import { MOCK_ROUTES, generateRandomPath } from './data/mockRoutes';
import { useSimulation } from './hooks/useSimulation';
import { MapPin, Route as RouteIcon, Info, ChevronUp, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  const [routes, setRoutes] = useState<Route[]>(MOCK_ROUTES);
  const [center, setCenter] = useState<Coordinate>({ lat: 24.5854, lng: 73.7125 }); // Udaipur
  const [selectedStop, setSelectedStop] = useState<Stop | null>(null);
  const [isStatsOpen, setIsStatsOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(true);

  const vehicles = useSimulation(routes);

  const handleSearchResult = (result: SearchResult) => {
    const newCenter = { lat: parseFloat(result.lat), lng: parseFloat(result.lon) };
    setCenter(newCenter);
    
    // Generate multiple dummy routes for the searched location
    const newRoutes: Route[] = [
      {
        id: `gen-${Date.now()}-1`,
        name: `${result.display_name.split(',')[0]} Main Line`,
        path: generateRandomPath(newCenter, 6),
        stops: [
          { id: 's1', name: 'Starting Point', ...newCenter },
          { id: 's2', name: 'Intermediate Stop', lat: newCenter.lat + 0.003, lng: newCenter.lng + 0.003 },
          { id: 's3', name: 'Final Terminal', lat: newCenter.lat + 0.006, lng: newCenter.lng + 0.006 }
        ]
      },
      {
        id: `gen-${Date.now()}-2`,
        name: `${result.display_name.split(',')[0]} Outer Loop`,
        path: generateRandomPath({ lat: newCenter.lat - 0.005, lng: newCenter.lng - 0.005 }, 10),
        stops: [
          { id: 's4', name: 'South Gate', lat: newCenter.lat - 0.005, lng: newCenter.lng - 0.005 },
          { id: 's5', name: 'Lake View Stop', lat: newCenter.lat - 0.002, lng: newCenter.lng - 0.002 }
        ]
      }
    ];
    setRoutes(newRoutes);
    setSelectedStop(null);
  };

  const activeVehiclesCount = vehicles.length;
  const avgOccupancy = vehicles.length > 0 
    ? (vehicles.reduce((acc, v) => acc + v.occupancy, 0) / vehicles.length).toFixed(1)
    : 0;

  return (
    <div className="flex flex-col h-screen bg-[#0A0A0B] text-slate-300 font-sans overflow-hidden">
      {/* Header Navigation */}
      <nav className="h-16 border-b border-white/10 flex items-center justify-between px-6 bg-[#0E0E10] z-30 shrink-0">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-emerald-500/20 rounded-xl flex items-center justify-center border border-emerald-500/30">
            <div className="w-5 h-5 bg-emerald-500 rounded-sm transform rotate-45"></div>
          </div>
          <div className="hidden sm:block">
            <h1 className="text-white font-bold tracking-tight text-lg leading-tight">YATRI-MITRA</h1>
            <p className="text-[10px] text-emerald-500 font-mono uppercase tracking-[0.2em] leading-none">Shared Mobility Tracker</p>
          </div>
        </div>
        
        <div className="flex-1 max-w-md mx-4 sm:mx-12">
          <SearchBar onSearchResult={handleSearchResult} />
        </div>

        <div className="hidden md:flex items-center gap-6">
          <div className="text-right">
            <div className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">System Status</div>
            <div className="text-xs text-emerald-400 flex items-center justify-end gap-1.5 font-mono">
              <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></span> ONLINE
            </div>
          </div>
          <div className="h-10 w-[1px] bg-white/10"></div>
          <div className="text-lg font-mono text-white">
            {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })}
          </div>
        </div>
      </nav>

      {/* Main Map Content */}
      <div className="flex-1 relative bg-[#0F0F11]">
        <MapView 
          routes={routes} 
          vehicles={vehicles} 
          center={center}
          onSelectVehicle={() => {}}
          onSelectStop={(stop) => {
             setSelectedStop(stop);
             setDrawerOpen(true);
          }}
        />

        {/* Stats Grid - Top Right Overlay */}
        <div className="absolute top-6 right-6 z-10 flex flex-col gap-3">
          <motion.div 
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="bg-[#1A1A1D]/90 backdrop-blur border border-white/10 p-3 rounded-xl shadow-2xl min-w-[160px]"
          >
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
              <span className="text-[11px] text-slate-300 font-bold uppercase tracking-widest">{activeVehiclesCount} ACTIVE UNITS</span>
            </div>
          </motion.div>
          
          <motion.div 
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="bg-[#1A1A1D]/90 backdrop-blur border border-white/10 p-3 rounded-xl shadow-2xl min-w-[160px]"
          >
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-slate-600 rounded-full"></div>
              <span className="text-[11px] text-slate-500 font-bold uppercase tracking-widest">AVG LOAD: {avgOccupancy} PAX</span>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Bottom Dashboard / Drawer */}
      <motion.div 
        animate={{ height: drawerOpen ? 'auto' : '64px' }}
        className="bg-[#121214] border-t border-white/10 shadow-2xl z-20 relative rounded-t-3xl overflow-hidden max-h-[70vh] flex flex-col"
      >
        <button 
          onClick={() => setDrawerOpen(!drawerOpen)}
          className="w-full h-16 flex items-center justify-center shrink-0 group border-b border-white/5"
        >
          <div className="absolute top-3 w-12 h-1 bg-white/10 rounded-full group-hover:bg-emerald-500/50 transition-colors"></div>
          <div className="flex items-center gap-2 text-slate-500 font-bold text-xs uppercase tracking-widest">
            {drawerOpen ? <ChevronDown size={18} /> : <ChevronUp size={18} />}
            {selectedStop ? `STOP: ${selectedStop.name}` : 'MOBILITY TRACKER DASHBOARD'}
          </div>
        </button>

        <div className="overflow-y-auto custom-scrollbar flex-1">
          <AnimatePresence mode="wait">
            {drawerOpen && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
              >
                <ETADashboard selectedStop={selectedStop} vehicles={vehicles} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* APK Branding Bottom Bar */}
      <div className="h-1 bg-emerald-500 flex shrink-0">
        <div className="flex-1 bg-gradient-to-r from-emerald-500 via-emerald-400 to-emerald-600"></div>
      </div>
    </div>
  );
}
