'use client';

import type { Train } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Circle, TrainFront } from 'lucide-react';

type RouteTimelineProps = {
  train: Train;
};

const generateTimelineData = (train: Train) => {
  const departure = new Date(train.departureTime);
  const arrival = new Date(train.arrivalTime);
  const now = Date.now();

  const totalDuration = arrival.getTime() - departure.getTime();
  const elapsedTime = now - departure.getTime();
  const progress = Math.max(0, Math.min(1, elapsedTime / totalDuration));

  const segmentCount = train.route.length - 1;
  const currentSegment = Math.floor(progress * segmentCount);
  
  return {
    timelineStations: train.route.map((station, index) => ({
        name: station,
        isCurrent: index === currentSegment,
        isPassed: index < currentSegment || progress >= 1,
    })),
    progress,
  };
};


export function RouteTimeline({ train }: RouteTimelineProps) {
  const { timelineStations, progress } = generateTimelineData(train);

  return (
    <div className="w-full overflow-x-auto py-4 px-2">
      <div className="relative flex justify-between items-start">
        {/* Background Line */}
        <div className="absolute top-2 left-0 w-full h-0.5 bg-muted" />
        
        {/* Progress Line */}
        <div 
          className="absolute top-2 left-0 h-0.5 bg-primary"
          style={{ width: `${progress * 100}%` }}
        />

        {timelineStations.map((station, index) => (
          <div key={station.name} className="relative flex flex-col items-center flex-1 px-2">
             {/* Station Dot */}
             <div className={cn(
                "relative z-10 h-4 w-4 rounded-full border-2 transition-colors",
                station.isPassed || station.isCurrent ? "bg-primary border-primary" : "bg-card border-muted-foreground",
                station.isCurrent && "animate-pulse"
              )}>
              {station.isCurrent && (
                 <TrainFront className="absolute -top-6 left-1/2 -translate-x-1/2 h-5 w-5 text-primary" />
              )}
             </div>
            
            {/* Station Label */}
            <div className="mt-2 text-center">
              <p className={cn(
                "font-semibold text-xs truncate",
                 (station.isPassed || station.isCurrent) ? "text-foreground" : "text-muted-foreground"
                )}>{station.name}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
