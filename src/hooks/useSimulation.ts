import { useState, useEffect, useRef, useMemo } from 'react';
import { Vehicle, Route, VehicleType, VehicleStatus } from '../types';
import { getPositionAlongPath, getPathLength } from '../utils/geoUtils';

export function useSimulation(activeRoutes: Route[]) {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const requestRef = useRef<number>(null);
  const lastTimeRef = useRef<number>(performance.now());

  // Cache route lengths
  const routeLengths = useMemo(() => {
    const lengths: Record<string, number> = {};
    activeRoutes.forEach(r => {
      lengths[r.id] = getPathLength(r.path);
    });
    return lengths;
  }, [activeRoutes]);

  // Initialize vehicles for routes
  useEffect(() => {
    const initialVehicles: Vehicle[] = [];
    activeRoutes.forEach((route) => {
      // Add 2-4 vehicles per route
      const numVehicles = 3 + Math.floor(Math.random() * 2);
      for (let i = 0; i < numVehicles; i++) {
        const typeRoll = Math.random();
        let type = VehicleType.AUTO;
        if (typeRoll > 0.7) type = VehicleType.BIKE;
        else if (typeRoll > 0.4) type = VehicleType.CAB;

        initialVehicles.push({
          id: `v-${route.id}-${i}`,
          type,
          routeId: route.id,
          position: route.path[0],
          speed: 15 + Math.random() * 25, // 15-40 km/h (bikes/autos are slower)
          occupancy: type === VehicleType.BIKE ? 1 : Math.floor(Math.random() * 4),
          maxOccupancy: type === VehicleType.BIKE ? 1 : (type === VehicleType.AUTO ? 3 : 4),
          direction: Math.random() > 0.5 ? 1 : -1,
          status: VehicleStatus.ACTIVE,
          progress: Math.random(), 
          lastUpdateTime: performance.now()
        });
      }
    });
    setVehicles(initialVehicles);
  }, [activeRoutes]);

  const animate = (time: number) => {
    const deltaTime = (time - lastTimeRef.current) / 1000; // in seconds
    // Cap deltaTime to prevent huge jumps on tab switch
    const cappedDelta = Math.min(deltaTime, 0.1); 
    lastTimeRef.current = time;

    setVehicles((prev) => 
      prev.map((v) => {
        const route = activeRoutes.find((r) => r.id === v.routeId);
        if (!route) return v;

        const pathLen = routeLengths[v.routeId] || 1;
        const speedKms = v.speed / 3600;
        const distMoved = speedKms * cappedDelta;
        const progressDelta = distMoved / pathLen;

        let nextProgress = v.progress + progressDelta * v.direction;

        // Loop continuous
        let nextDirection = v.direction;
        if (nextProgress > 1) {
          nextProgress = 1;
          nextDirection = -1;
        } else if (nextProgress < 0) {
          nextProgress = 0;
          nextDirection = 1;
        }

        const nextPos = getPositionAlongPath(route.path, nextProgress);

        return {
          ...v,
          progress: nextProgress,
          direction: nextDirection,
          position: nextPos,
          lastUpdateTime: time
        };
      })
    );

    requestRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    requestRef.current = requestAnimationFrame(animate);
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [activeRoutes]);

  return vehicles;
}
