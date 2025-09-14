'use client';

import { useState, useEffect, useMemo } from 'react';
import type { Train, Conflict } from '@/lib/types';
import {
  Train as TrainIcon,
  AlertTriangle,
  Move,
  ZoomIn,
  ZoomOut,
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
      const currentStationName = train.route[currentStationIndex];
      if (positions[currentStationName]) {
        newTrainPositions[train.id] = positions[currentStationName];
      }
    });
    return newTrainPositions;
  }, [trains, positions, currentStationIndices]);

  return (
    <div className="relative h-full w-full bg-card flex-1 overflow-hidden">
      <TooltipProvider>
        <div className="absolute inset-0 bg-background pattern-dots pattern-gray-300 pattern-bg-white pattern-size-6 pattern-opacity-20 dark:pattern-gray-700 dark:pattern-bg-slate-900"></div>
        
        <svg className="absolute inset-0 w-full h-full" style={{ pointerEvents: 'none' }}>
            <defs>
              <marker id="dot" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="5" markerHeight="5">
                <circle cx="5" cy="5" r="5" fill="hsl(var(--muted-foreground) / 0.5)" />
              </marker>
            </defs>
            {trains.map(train => (
              train.route.map((station, index) => {
                if (index === 0) return null;
                const fromStation = train.route[index-1];
                const toStation = station;
                const pos1 = positions[fromStation];
                const pos2 = positions[toStation];
                if (!pos1 || !pos2) return null;

                return (
                  <line 
                    key={`${train.id}-${fromStation}-${toStation}`}
                    x1={`${pos1.x}%`} y1={`${pos1.y}%`}
                    x2={`${pos2.x}%`} y2={`${pos2.y}%`}
                    stroke="hsl(var(--muted-foreground) / 0.3)"
                    strokeWidth="2"
                    strokeDasharray="4 6"
                  />
                )
              })
            ))}
        </svg>


        {Object.entries(positions).map(([id, pos]) => {
          const isStation = trains.some(t => t.route.includes(id));
          const isConflictLocation = conflicts.some(c => c.location === id);
          
          if (isStation && !isConflictLocation) {
             const isTrainHere = trains.some(train => {
                const currentStationIndex = currentStationIndices[train.id] ?? 0;
                return train.route[currentStationIndex] === id;
            });
            return (
              <div key={id} style={{...pos}} className="absolute -translate-x-1/2 -translate-y-1/2">
                <Tooltip>
                  <TooltipTrigger>
                    <div className={cn("w-2 h-2 rounded-full bg-muted-foreground/50 transition-all", isTrainHere && "w-3 h-3 bg-primary animate-pulse ring-4 ring-primary/30")}></div>
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
            return (
              <Tooltip key={train.id}>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => onSelectTrain(train.id)}
                    className={cn(
                      'absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center justify-center transition-all duration-300 ease-in-out transform hover:scale-125 focus:outline-none focus:ring-2 focus:ring-primary rounded-full p-1 group',
                      isActive ? 'z-20 scale-125' : 'z-10'
                    )}
                    style={{ top: pos.top, left: pos.left }}
                  >
                    <TrainIcon
                      className={cn(
                        'h-8 w-8 transition-colors text-primary-foreground fill-primary',
                        isActive && 'fill-accent text-accent-foreground'
                      )}
                    />
                    <span
                      className={cn(
                        'text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-background/80 backdrop-blur-sm mt-1 transition-opacity group-hover:opacity-100',
                        isActive ? 'opacity-100' : 'opacity-0'
                      )}
                    >
                      {train.name}
                    </span>
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
                    <AlertTriangle className="h-7 w-7 text-accent-foreground fill-accent animate-pulse" />
                  </div>
                </TooltipTrigger>
                <TooltipContent side="top">
                  <p className="font-semibold">Conflict: {conflict.location}</p>
                  <p className="text-sm text-muted-foreground">Severity: {conflict.severity}</p>
                </TooltipContent>
              </Tooltip>
            );
        })}


        <div className="absolute bottom-4 right-4 z-10 flex flex-col gap-2">
            <Button variant="outline" size="icon" className="bg-background/80 backdrop-blur-sm"><ZoomIn /></Button>
            <Button variant="outline" size="icon" className="bg-background/80 backdrop-blur-sm"><ZoomOut /></Button>
            <Button variant="outline" size="icon" className="bg-background/80 backdrop-blur-sm"><Move /></Button>
        </div>
      </TooltipProvider>
    </div>
  );
}
