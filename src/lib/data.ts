import type { Train, Weather, Maintenance, UserPreferences } from './types';

export const initialTrains: Train[] = [
  {
    id: 'T001',
    name: 'Metropolis Express',
    origin: 'Central Station',
    destination: 'North Hub',
    departureTime: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
    arrivalTime: new Date(Date.now() + 5 * 60 * 60 * 1000).toISOString(),
    status: 'On Time',
    currentLocation: { lat: 34.0522, lng: -118.2437 },
    route: ['Central Station', 'Midtown', 'Uptown', 'North Hub'],
  },
  {
    id: 'T002',
    name: 'Coastal Liner',
    origin: 'East Port',
    destination: 'West Bay',
    departureTime: new Date(Date.now() + 1 * 60 * 60 * 1000).toISOString(),
    arrivalTime: new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString(),
    status: 'On Time',
    currentLocation: { lat: 34.1522, lng: -118.4437 },
    route: ['East Port', 'Seaside Town', 'Ocean View', 'West Bay'],
  },
  {
    id: 'T003',
    name: 'Mountain Mover',
    origin: 'South Peak',
    destination: 'Valley Town',
    departureTime: new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString(),
    arrivalTime: new Date(Date.now() + 7 * 60 * 60 * 1000).toISOString(),
    status: 'On Time',
    currentLocation: { lat: 33.9522, lng: -118.1437 },
    route: ['South Peak', 'Pine Forest', 'River Cross', 'Valley Town'],
  },
  {
    id: 'T004',
    name: 'Industrial Hauler',
    origin: 'Factory Complex',
    destination: 'Distribution Center',
    departureTime: new Date(Date.now() + 0.5 * 60 * 60 * 1000).toISOString(),
    arrivalTime: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(),
    status: 'On Time',
    currentLocation: { lat: 34.0022, lng: -118.3437 },
    route: ['Factory Complex', 'Uptown', 'Cargo Terminal', 'Distribution Center'],
  },
];

export const weatherData: Weather[] = [
  { location: 'Uptown', condition: 'Heavy Rain', temperature: 15 },
  { location: 'Pine Forest', condition: 'Clear', temperature: 22 },
];

export const maintenanceData: Maintenance[] = [
  {
    trackSegment: 'Uptown -> North Hub',
    startTime: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(),
    endTime: new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString(),
    description: 'Track replacement work.',
  },
];

export const initialPreferences: UserPreferences = {
  prioritize: 'passenger',
  avoid: ['tunnels'],
};
