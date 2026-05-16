import { Route, VehicleType, Coordinate } from '../types';

// Example town: "Udaipur-like" small town layout
export const MOCK_ROUTES: Route[] = [
  {
    id: 'route-1',
    name: 'Old City - Railway Station',
    path: [
      { lat: 24.5712, lng: 73.6915 }, // Jagdish Temple
      { lat: 24.5750, lng: 73.6950 },
      { lat: 24.5800, lng: 73.7000 },
      { lat: 24.5830, lng: 73.7100 },
      { lat: 24.5800, lng: 73.7150 }  // Railway Station
    ],
    stops: [
      { id: 'stop-1a', name: 'Jagdish Temple', lat: 24.5712, lng: 73.6915 },
      { id: 'stop-1b', name: 'Delhi Gate', lat: 24.5800, lng: 73.7000 },
      { id: 'stop-1c', name: 'Udaipur Railway Station', lat: 24.5800, lng: 73.7150 }
    ]
  },
  {
    id: 'route-2',
    name: 'Fateh Sagar - Celebration Mall',
    path: [
      { lat: 24.5910, lng: 73.6820 }, // Fateh Sagar
      { lat: 24.6000, lng: 73.6900 },
      { lat: 24.6100, lng: 73.6950 },
      { lat: 24.6200, lng: 73.7050 }  // Celebration Mall
    ],
    stops: [
      { id: 'stop-2a', name: 'Fateh Sagar Lake', lat: 24.5910, lng: 73.6820 },
      { id: 'stop-2b', name: 'Sukhadia Circle', lat: 24.6000, lng: 73.6900 },
      { id: 'stop-2c', name: 'Celebration Mall', lat: 24.6200, lng: 73.7050 }
    ]
  }
];

export function generateRandomPath(center: Coordinate, count: number = 8): Coordinate[] {
  const path: Coordinate[] = [];
  let current = { ...center };
  for (let i = 0; i < count; i++) {
    path.push({ ...current });
    current.lat += (Math.random() - 0.5) * 0.02;
    current.lng += (Math.random() - 0.5) * 0.02;
  }
  return path;
}
