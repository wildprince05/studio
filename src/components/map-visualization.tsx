'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import type { Train, Conflict } from '@/lib/types';
import {
  AlertTriangle,
  Move,
  Plus,
  Minus,
  MapPin,
  TrainFront
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from './ui/button';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from './ui/tooltip';

type MapItemPosition = {
  top: string;
  left: string;
  x: number;
  y: number;
};

const MAP_GRID_SIZE = 20;

const positionCache = new Map<string, MapItemPosition>();

const generatePosition = (id: string): MapItemPosition => {
  if (positionCache.has(id)) {
    return positionCache.get(id)!;
  }
  const hash = id.split('').reduce((acc, char) => char.charCodeAt(0) + ((acc << 5) - acc), 0);
  const x = Math.abs(hash) % MAP_GRID_SIZE;
  const y = Math.abs(hash * 31) % MAP_GRID_SIZE;
  
  const position = {
    top: `${(y / MAP_GRID_SIZE) * 100}%`,
    left: `${(x / MAP_GRID_SIZE) * 100}%`,
    x: (x / MAP_GRID_SIZE) * 100,
    y: (y / MAP_GRID_SIZE) * 100,
  };
  positionCache.set(id, position);
  return position;
};


const getCurrentStationIndex = (train: Train) => {
    const now = Date.now();
    const departureTime = new Date(train.departureTime).getTime();
    const arrivalTime = new Date(train.arrivalTime).getTime();

    if (now < departureTime) return 0; // Not departed yet, at origin
    if (now > arrivalTime) return train.route.length - 1; // Arrived at destination

    const totalDuration = arrivalTime - departureTime;
    const elapsedTime = now - departureTime;
    const progress = elapsedTime / totalDuration;
    
    const segmentCount = train.route.length - 1;
    const currentSegment = Math.floor(progress * segmentCount);
    
    return currentSegment;
}

const getCurvePath = (x1: number, y1: number, x2: number, y2: number) => {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const midX = x1 + dx / 2;
  const midY = y1 + dy / 2;
  const curvature = 0.2;
  const ctrlX = midX + dy * curvature;
  const ctrlY = midY - dx * curvature;

  return `M${x1},${y1} Q${ctrlX},${ctrlY} ${x2},${y2}`;
};

export function MapVisualization({
  trains,
  conflicts,
  activeTrainId,
  activeConflictId,
  onSelectTrain,
}: {
  trains: Train[];
  conflicts: Conflict[];
  activeTrainId?: string;
  activeConflictId?: string;
  onSelectTrain: (id: string) => void;
}) {
  const [positions, setPositions] = useState<Record<string, MapItemPosition>>({});
  const [currentStationIndices, setCurrentStationIndices] = useState<Record<string, number>>({});
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const newPositions: Record<string, MapItemPosition> = {};
    const allStations = new Set<string>();

    trains.forEach(train => {
      train.route.forEach(station => allStations.add(station));
    });
    conflicts.forEach(conflict => {
       newPositions[conflict.id] = generatePosition(conflict.location);
    });

    allStations.forEach(station => {
        newPositions[station] = generatePosition(station);
    });

    setPositions(newPositions);

    const updateStations = () => {
        const indices: Record<string, number> = {};
        trains.forEach(train => {
            indices[train.id] = getCurrentStationIndex(train);
        });
        setCurrentStationIndices(indices);
    };

    updateStations();
    const interval = setInterval(updateStations, 5000); // Update every 5 seconds

    return () => clearInterval(interval);

  }, [trains, conflicts]);

  const trainPositions = useMemo(() => {
    const newTrainPositions: Record<string, MapItemPosition> = {};
    trains.forEach(train => {
      const currentStationIndex = currentStationIndices[train.id] ?? 0;
      const nextStationIndex = Math.min(train.route.length - 1, currentStationIndex + 1);
      
      const currentStationName = train.route[currentStationIndex];
      const nextStationName = train.route[nextStationIndex];

      const pos1 = positions[currentStationName];
      const pos2 = positions[nextStationName];

      if (pos1 && pos2) {
          const now = Date.now();
          const departureTime = new Date(train.departureTime).getTime();
          const arrivalTime = new Date(train.arrivalTime).getTime();
          const totalDuration = arrivalTime - departureTime;
          const segmentDuration = totalDuration / (train.route.length - 1);
          const segmentStartTime = departureTime + currentStationIndex * segmentDuration;
          
          let progress = 0;
          if(now > segmentStartTime && currentStationIndex < train.route.length -1) {
              const elapsedTimeInSegment = now - segmentStartTime;
              progress = Math.min(1, elapsedTimeInSegment / segmentDuration);
          }

        newTrainPositions[train.id] = {
          x: pos1.x + (pos2.x - pos1.x) * progress,
          y: pos1.y + (pos2.y - pos1.y) * progress,
          top: `${pos1.y + (pos2.y - pos1.y) * progress}%`,
          left: `${pos1.x + (pos2.x - pos1.x) * progress}%`,
        };
      } else if (pos1) {
        newTrainPositions[train.id] = pos1;
      }
    });
    return newTrainPositions;
  }, [trains, positions, currentStationIndices]);
  
  const handleZoomIn = () => setZoom(z => Math.min(z + 0.2, 2));
  const handleZoomOut = () => setZoom(z => Math.max(z - 0.2, 0.6));

  return (
    <div ref={mapRef} className="relative h-full w-full bg-transparent flex-1 overflow-hidden">
      <TooltipProvider>
        <div className="absolute inset-0 pattern-grid" style={{'--grid-color': 'hsl(var(--primary)/0.1)', '--grid-size': '30px'} as React.CSSProperties}></div>
        
        <div
          className="w-full h-full transition-transform duration-300 ease-in-out"
          style={{ transform: `scale(${zoom}) translate(${pan.x}px, ${pan.y}px)` }}
        >
        <svg className="absolute inset-0 w-full h-full" style={{ pointerEvents: 'none' }}>
            {trains.map(train => {
              return train.route.map((station, index) => {
                if (index === 0) return null;
                const fromStation = train.route[index-1];
                const toStation = station;
                const pos1 = positions[fromStation];
                const pos2 = positions[toStation];
                if (!pos1 || !pos2 || !mapRef.current) return null;
                
                const mapWidth = mapRef.current.clientWidth;
                const mapHeight = mapRef.current.clientHeight;

                const x1 = (pos1.x / 100) * mapWidth;
                const y1 = (pos1.y / 100) * mapHeight;
                const x2 = (pos2.x / 100) * mapWidth;
                const y2 = (pos2.y / 100) * mapHeight;

                const pathData = getCurvePath(x1, y1, x2, y2);

                return (
                  <path 
                    key={`${train.id}-${fromStation}-${toStation}`}
                    d={pathData}
                    stroke={'hsl(var(--primary)/0.3)'}
                    strokeWidth="2"
                    strokeDasharray="4 4"
                    fill="none"
                  />
                )
              })
            })}
        </svg>

        {Object.entries(positions).map(([id, pos]) => {
          const isStation = trains.some(t => t.route.includes(id));
          const isConflictLocation = conflicts.some(c => c.location === id);
          
          if (isStation && !isConflictLocation) {
            return (
              <div key={id} style={{...pos}} className="absolute -translate-x-1/2 -translate-y-1/2">
                <Tooltip>
                  <TooltipTrigger asChild>
                     <div className={cn("flex items-center justify-center")}>
                        <div className="w-2 h-2 bg-primary/50 border border-primary rounded-full" />
                     </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{id}</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            )
          }
          return null;
        })}
        
        {Object.entries(trainPositions).map(([trainId, pos]) => {
            const train = trains.find(t => t.id === trainId);
            if (!train) return null;
            const isActive = train.id === activeTrainId;
            
            const trainColor = train.delay > 0 ? 'text-yellow-400' : 'text-green-500';
            
            return (
              <Tooltip key={train.id}>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => onSelectTrain(train.id)}
                    className={cn(
                      'absolute -translate-x-1/2 -translate-y-1/2 flex items-center justify-center transition-all duration-1000 linear transform hover:scale-125 focus:outline-none rounded-full group',
                      isActive ? 'z-20 scale-125' : 'z-10'
                    )}
                    style={{ top: pos.top, left: pos.left }}
                  >
                     <TrainFront className={cn("w-6 h-6 drop-shadow-lg", isActive ? "text-primary" : trainColor)} />
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="font-semibold">{train.name}</p>
                  <p className="text-sm text-muted-foreground">{train.status}</p>
                </TooltipContent>
              </Tooltip>
            );
        })}
        
        {conflicts.map(conflict => {
          const pos = positions[conflict.id];
          if (!pos) return null;
          const isActive = conflict.id === activeConflictId;
            return (
              <Tooltip key={conflict.id}>
                <TooltipTrigger asChild>
                  <div
                    className={cn(
                      'absolute -translate-x-1/2 -translate-y-1/2 transition-all duration-300 ease-in-out',
                      isActive ? 'z-30 scale-125' : 'z-20'
                    )}
                    style={{ top: pos.top, left: pos.left }}
                  >
                    <div className="relative">
                      <AlertTriangle className="h-8 w-8 text-red-500 fill-red-500/50" />
                      <div className="absolute inset-0 rounded-full bg-red-500/50 animate-ping -z-10"></div>
                    </div>
                  </div>
                </TooltipTrigger>
                <TooltipContent side="top">
                  <p className="font-semibold">Conflict: {conflict.location}</p>
                  <p className="text-sm text-muted-foreground">Severity: {conflict.severity}</p>
                </TooltipContent>
              </Tooltip>
            );
        })}

        </div>

        <div className="absolute bottom-4 right-4 z-10 flex flex-col gap-2">
            <Button variant="outline" size="icon" className="bg-background/80 backdrop-blur-sm" onClick={handleZoomIn}><Plus /></Button>
            <Button variant="outline" size="icon" className="bg-background/80 backdrop-blur-sm" onClick={handleZoomOut}><Minus /></Button>
            <Button variant="outline" size="icon" className="bg-background/80 backdrop-blur-sm" onClick={() => setPan({x: 0, y: 0})}><Move /></Button>
        </div>
      </TooltipProvider>
    </div>
  );
}
