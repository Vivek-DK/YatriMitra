import { Vehicle, Stop } from '../types';
import { getDistance, calculateETA } from '../utils/geoUtils';
import { Clock, Navigation, Users, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ETADashboardProps {
  selectedStop: Stop | null;
  vehicles: Vehicle[];
}

export default function ETADashboard({ selectedStop, vehicles }: ETADashboardProps) {
  if (!selectedStop) {
    return (
      <div className="p-6 text-center text-slate-500 animate-pulse">
        Select a stop on the map to see incoming vehicles
      </div>
    );
  }

  // Find vehicles moving towards this stop (simplification for simulation)
  // In real app, we'd check if stop is on v.route and v.direction leads to it
  const upcomingVehicles = vehicles
    .map(v => {
      const distance = getDistance(v.position, { lat: selectedStop.lat, lng: selectedStop.lng });
      const etaValue = calculateETA(distance, v.speed);
      return { ...v, distance, etaValue };
    })
    .sort((a, b) => a.etaValue - b.etaValue)
    .slice(0, 3);

  return (
    <div className="p-6">
      <div className="mb-6 border-b border-white/5 pb-6 bg-gradient-to-b from-white/[0.02] to-transparent -mx-6 px-6">
        <label className="text-[10px] text-slate-500 uppercase tracking-[0.2em] font-black block mb-2">Selected Node</label>
        <div className="flex items-center justify-between">
          <h2 className="text-2xl text-white font-light tracking-tight">{selectedStop.name}</h2>
          <div className="bg-emerald-500/10 text-emerald-500 p-2 rounded-xl border border-emerald-500/20">
            <Navigation size={20} />
          </div>
        </div>
      </div>

      {/* Stats Grid from Theme */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="p-3 bg-white/5 rounded-xl border border-white/5">
          <div className="text-[9px] text-slate-500 uppercase font-black mb-1">Avg Speed</div>
          <div className="text-lg text-white font-mono">
            {(vehicles.reduce((acc, v) => acc + v.speed, 0) / (vehicles.length || 1)).toFixed(0)} 
            <span className="text-[10px] text-slate-600 ml-1 uppercase">km/h</span>
          </div>
        </div>
        <div className="p-3 bg-white/5 rounded-xl border border-white/5">
          <div className="text-[9px] text-slate-500 uppercase font-black mb-1">Active Routes</div>
          <div className="text-lg text-white font-mono">{new Set(vehicles.map(v => v.routeId)).size}</div>
        </div>
        <div className="p-3 bg-white/5 rounded-xl border border-white/5">
          <div className="text-[9px] text-slate-500 uppercase font-black mb-1">CO2 Potential</div>
          <div className="text-lg text-emerald-400 font-mono">0.8<span className="text-[10px] ml-1 uppercase">kg/km</span></div>
        </div>
        <div className="p-3 bg-white/5 rounded-xl border border-white/5">
          <div className="text-[9px] text-slate-500 uppercase font-black mb-1">Sync Status</div>
          <div className="text-lg text-emerald-500 font-mono text-[11px] font-black uppercase tracking-widest flex items-center gap-1.5 pt-1">
            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div> LIVE
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <label className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-1">Incoming Mobility Units</label>
        <AnimatePresence mode="popLayout">
          {upcomingVehicles.map((v) => (
            <motion.div
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              key={v.id}
              className="bg-white/5 rounded-2xl p-4 border border-white/10 hover:bg-white/[0.07] transition-all group cursor-pointer"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className={`p-2.5 rounded-xl border ${
                    v.type === 'auto' 
                      ? 'bg-amber-500/10 border-amber-500/30 text-amber-500' 
                      : v.type === 'cab'
                        ? 'bg-blue-500/10 border-blue-500/30 text-blue-500'
                        : 'bg-rose-500/10 border-rose-500/30 text-rose-500'
                  }`}>
                    {v.type === 'auto' ? '🛺' : v.type === 'cab' ? '🚕' : '🚲'}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-black text-white/80 uppercase tracking-tighter">
                        {v.type.toUpperCase()}-{v.id.split('-').slice(-1)}
                      </span>
                      <span className="px-1.5 py-0.5 bg-white/10 text-slate-400 text-[9px] rounded font-bold uppercase tracking-wider">
                        {Math.round(v.speed)} km/h
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-500 mt-0.5">Route ID: {v.routeId}</div>
                  </div>
                </div>
                <div className={`px-2 py-1 rounded text-[9px] font-black tracking-widest ${
                  v.occupancy >= v.maxOccupancy 
                    ? 'bg-orange-500/20 text-orange-500' 
                    : 'bg-emerald-500/20 text-emerald-500'
                }`}>
                  {v.occupancy}/{v.maxOccupancy} OCC
                </div>
              </div>

              <div className="flex justify-between items-end">
                <div className="flex-1 mr-4">
                  <div className="flex justify-between text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1.5">
                    <span>PROGRESS TO STOP</span>
                    <span>{Math.max(0, 100 - (v.distance * 10)).toFixed(0)}%</span>
                  </div>
                  <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.max(10, 100 - (v.distance * 10))}%` }}
                      className={`h-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]`}
                    ></motion.div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] text-emerald-500 uppercase font-mono font-bold leading-none">Arrival in</div>
                  <div className="text-3xl text-white font-mono leading-none mt-1 group-hover:text-emerald-400 transition-colors">
                    {v.etaValue < 1 ? '<1' : Math.round(v.etaValue).toString().padStart(2, '0')}
                    <span className="text-sm text-slate-600 ml-1">m</span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
      
      {upcomingVehicles.length === 0 && (
        <div className="p-12 text-center border-2 border-dashed border-white/5 rounded-2xl">
          <Info className="mx-auto text-slate-700 mb-2" size={32} />
          <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">No matching units tracked</p>
        </div>
      )}
    </div>
  );
}
