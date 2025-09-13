'use client';

import { useState, useEffect, useMemo } from 'react';
import type { Train, Conflict } from '@/lib/types';
import {
  Train as TrainIcon,
  AlertTriangle,
  Move,
  ZoomIn,
  ZoomOut,
  Minus,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from './ui/button';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from './ui/tooltip';

type MapItemPosition = {
  top: string;
  left: string;
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
  };
  positionCache.set(id, position);
  return position;
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
  
  useEffect(() => {
    const newPositions: Record<string, MapItemPosition> = {};
    trains.forEach(train => {
      newPositions[train.id] = generatePosition(train.id);
      train.route.forEach(station => {
        if (!newPositions[station]) {
          newPositions[station] = generatePosition(station);
        }
      });
    });
    conflicts.forEach(conflict => {
      newPositions[conflict.id] = generatePosition(conflict.location);
    });
    setPositions(newPositions);
  }, [trains, conflicts]);

  const gridLines = useMemo(() => {
    const lines = [];
    for (let i = 1; i < MAP_GRID_SIZE; i++) {
      lines.push(
        <div key={`v-${i}`} className="absolute top-0 bottom-0 bg-border/50" style={{ left: `${(i / MAP_GRID_SIZE) * 100}%`, width: '1px' }}></div>
      );
      lines.push(
        <div key={`h-${i}`} className="absolute left-0 right-0 bg-border/50" style={{ top: `${(i / MAP_GRID_SIZE) * 100}%`, height: '1px' }}></div>
      );
    }
    return lines;
  }, []);

  return (
    <div className="relative h-full w-full bg-card flex-1 overflow-hidden">
      <TooltipProvider>
        <div className="absolute inset-0 bg-background pattern-dots pattern-gray-300 pattern-bg-white pattern-size-6 pattern-opacity-20 dark:pattern-gray-700 dark:pattern-bg-slate-900"></div>
        
        <svg className="absolute inset-0 w-full h-full">
          {trains.map(train => (
            <g key={`route-${train.id}`}>
              {train.route.slice(0, -1).map((station, index) => {
                const nextStation = train.route[index + 1];
                const pos1 = positions[station];
                const pos2 = positions[nextStation];
                if (!pos1 || !pos2) return null;
                
                return (
                  <line
                    key={`${train.id}-${station}-${nextStation}`}
                    x1={pos1.left}
                    y1={pos1.top}
                    x2={pos2.left}
                    y2={pos2.top}
                    className={cn(
                      "stroke-current transition-all duration-300",
                      activeTrainId === train.id ? 'text-primary/70 stroke-[3]' : 'text-muted-foreground/30 stroke-[2]'
                    )}
                  />
                )
              })}
            </g>
          ))}
        </svg>

        {Object.entries(positions).map(([id, pos]) => {
          const train = trains.find(t => t.id === id);
          if (train) {
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
          }

          const conflict = conflicts.find(c => c.id === id);
          if (conflict) {
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
          }
          
          const stationName = trains.flatMap(t => t.route).find(r => r === id);
          if (stationName) {
            return (
              <div key={id} style={{...pos}} className="absolute -translate-x-1/2 -translate-y-1/2">
                <Tooltip>
                  <TooltipTrigger>
                    <div className="w-2 h-2 rounded-full bg-muted-foreground/50"></div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{stationName}</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            )
          }

          return null;
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
