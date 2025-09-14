export interface Train {
  id: string;
  name: string;
  type: 'Express' | 'Liner' | 'Hauler' | 'Cargo' | 'Passenger' | 'High-Speed';
  origin: string;
  destination: string;
  departureTime: string;
  arrivalTime: string;
  status: 'On Time' | 'Delayed' | 'Cancelled';
  delay: number; // in minutes
  currentLocation: { lat: number; lng: number };
  route: string[];
  currentSpeed?: number;
}

export interface Conflict {
  id: string;
  trainId1: string;
  trainId2: string;
  location: string;
  time: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH';
  description: string;
}

export interface Weather {
  location: string;
  condition: string;
  temperature: number;
}

export interface Maintenance {
  trackSegment: string;
  startTime: string;
  endTime: string;
  description: string;
}

export interface UserPreferences {
  prioritize: 'passenger' | 'cargo' | 'high-speed';
  avoid: ('tunnels' | 'bridges' | 'steep-grades')[];
}

export type AlternativeRoute = {
  route: string;
  estimatedTime: string;
  details: string;
};

export type ReschedulingProposal = {
  trainId: string;
  newDepartureTime: string;
  newArrivalTime: string;
  newRoute?: string[];
  reason: string;
};
