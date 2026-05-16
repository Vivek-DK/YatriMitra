import { Coordinate } from './types';

/**
 * Calculates the Haversine distance between two points in kilometers.
 */
export function getDistance(p1: Coordinate, p2: Coordinate): number {
  const R = 6371; // Earth's radius in km
  const dLat = (p2.lat - p1.lat) * Math.PI / 180;
  const dLng = (p2.lng - p1.lng) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(p1.lat * Math.PI / 180) * Math.cos(p2.lat * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Interpolates between two coordinates based on progress (0 to 1).
 */
export function interpolate(p1: Coordinate, p2: Coordinate, t: number): Coordinate {
  return {
    lat: p1.lat + (p2.lat - p1.lat) * t,
    lng: p1.lng + (p2.lng - p1.lng) * t
  };
}

/**
 * Calculates total distance of a path.
 */
export function getPathLength(path: Coordinate[]): number {
  let length = 0;
  for (let i = 0; i < path.length - 1; i++) {
    length += getDistance(path[i], path[i + 1]);
  }
  return length;
}

/**
 * Finds the position along a path for a given progress (0 to 1).
 */
export function getPositionAlongPath(path: Coordinate[], progress: number): Coordinate {
  if (path.length === 0) return { lat: 0, lng: 0 };
  if (path.length === 1) return path[0];
  
  const totalLength = getPathLength(path);
  let targetDist = progress * totalLength;
  let currentDist = 0;

  for (let i = 0; i < path.length - 1; i++) {
    const segmentLen = getDistance(path[i], path[i + 1]);
    if (currentDist + segmentLen >= targetDist) {
      const segmentProgress = (targetDist - currentDist) / segmentLen;
      return interpolate(path[i], path[i + 1], segmentProgress);
    }
    currentDist += segmentLen;
  }

  return path[path.length - 1];
}

/**
 * Calculates ETA in minutes.
 * ETA = (Distance / Speed) * 60 (to convert hours to minutes)
 */
export function calculateETA(distance: number, speed: number): number {
  if (speed <= 0) return Infinity;
  return (distance / speed) * 60;
}
