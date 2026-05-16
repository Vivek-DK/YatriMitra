export interface Coordinate {
  lat: number;
  lng: number;
}

export interface Route {
  id: string;
  name: string;
  path: Coordinate[];
  stops: Stop[];
}

export interface Stop {
  id: string;
  name: string;
  lat: number;
  lng: number;
}

export enum VehicleType {
  AUTO = 'auto',
  CAB = 'cab',
  BIKE = 'bike'
}

export enum VehicleStatus {
  ACTIVE = 'active',
  BREAKDOWN = 'breakdown',
  IDLE = 'idle'
}

export interface Vehicle {
  id: string;
  type: VehicleType;
  routeId: string;
  position: Coordinate;
  speed: number; // in km/h
  occupancy: number;
  maxOccupancy: number;
  direction: 1 | -1; // 1 for forward, -1 for backward along path
  status: VehicleStatus;
  progress: number; // 0 to 1 progress along the path
  lastUpdateTime: number;
}

export interface SearchResult {
  display_name: string;
  lat: string;
  lon: string;
  place_id: number;
}
