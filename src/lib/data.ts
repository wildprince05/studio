
import type { Train, Weather, Maintenance, UserPreferences } from './types';

export const initialTrains: Train[] = [
  {
    id: 'T12007',
    name: 'Shatabdi Express',
    type: 'Express',
    origin: 'Chennai Central',
    destination: 'KSR Bengaluru',
    departureTime: new Date(Date.now() + 1 * 60 * 60 * 1000).toISOString(),
    arrivalTime: new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString(),
    status: 'On Time',
    delay: 0,
    currentLocation: { lat: 13.0827, lng: 80.2707 },
    route: ['Chennai Central', 'Katpadi', 'Jolarpettai', 'KSR Bengaluru'],
    currentSpeed: 110,
  },
  {
    id: 'T12621',
    name: 'Tamil Nadu Express',
    type: 'High-Speed',
    origin: 'Chennai Central',
    destination: 'Hyderabad Deccan',
    departureTime: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
    arrivalTime: new Date(Date.now() + 14 * 60 * 60 * 1000).toISOString(),
    status: 'On Time',
    delay: 0,
    currentLocation: { lat: 13.0827, lng: 80.2707 },
    route: ['Chennai Central', 'Vijayawada', 'Warangal', 'Secunderabad', 'Hyderabad Deccan'],
    currentSpeed: 100,
  },
  {
    id: 'T22643',
    name: 'Patna Express',
    type: 'Liner',
    origin: 'Ernakulam',
    destination: 'Chennai Central',
    departureTime: new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString(),
    arrivalTime: new Date(Date.now() + 15 * 60 * 60 * 1000).toISOString(),
    status: 'On Time',
    delay: 10,
    currentLocation: { lat: 9.9816, lng: 76.2996 },
    route: ['Ernakulam', 'Coimbatore', 'Erode', 'Katpadi', 'Chennai Central'],
    currentSpeed: 70,
  },
  {
    id: 'T06057',
    name: 'MAS CBE Express',
    type: 'Cargo',
    origin: 'Chennai Central',
    destination: 'Coimbatore',
    departureTime: new Date(Date.now() + 0.5 * 60 * 60 * 1000).toISOString(),
    arrivalTime: new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString(),
    status: 'On Time',
    delay: 0,
    currentLocation: { lat: 13.0827, lng: 80.2707 },
    route: ['Chennai Central', 'Arakkonam', 'Katpadi', 'Salem', 'Erode', 'Coimbatore'],
    currentSpeed: 55,
  },
];

export const weatherData: Weather[] = [
  { location: 'Katpadi', condition: 'Clear', temperature: 32 },
  { location: 'Vijayawada', condition: 'Sunny', temperature: 35 },
];

export const maintenanceData: Maintenance[] = [
  {
    trackSegment: 'Katpadi -> Jolarpettai',
    startTime: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(),
    endTime: new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString(),
    description: 'Signal maintenance work.',
  },
];

export const initialPreferences: UserPreferences = {
  prioritize: 'passenger',
  avoid: ['tunnels'],
};
