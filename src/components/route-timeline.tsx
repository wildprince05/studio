'use client';

import type { Train } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Circle } from 'lucide-react';

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
  
  return train.route.map((station, index) => ({
      name: station,
      isCurrent: index === currentSegment,
      isPassed: index < currentSegment || progress >= 1,
  }));
};


export function RouteTimeline({ train }: RouteTimelineProps) {
  const timelineData = generateTimelineData(train);

  return (
    <div className="w-full overflow-x-auto p-8">
      <div className="relative w-full flex justify-between items-center h-20">
        {/* Horizontal Line */}
        <div className="absolute top-1/2 left-0 w-full h-0.5 bg-primary/50 -translate-y-1/2" />

        {timelineData.map((station, index) => (
          <div key={station.name} className="relative flex flex-col items-center">
             {/* Station Dot */}
             <div className={cn(
                "absolute top-1/2 -translate-y-1/2 h-3 w-3 rounded-full border-2 border-primary transition-colors",
                station.isPassed || station.isCurrent ? "bg-primary" : "bg-card"
              )} />
            
            {/* Station Label and Icon Container */}
            <div
              className={cn(
                'absolute flex flex-col items-center gap-2 w-32 text-center',
                index % 2 === 0 ? 'bottom-full mb-2' : 'top-full mt-2'
              )}
            >
              {/* Icon */}
              <div
                className={cn(
                  'h-8 w-8 rounded-full bg-primary flex items-center justify-center ring-4 ring-card transition-all',
                   (station.isPassed || station.isCurrent) ? 'bg-primary' : 'bg-muted',
                   station.isCurrent && 'animate-pulse'
                )}
              >
                <Circle className="h-3 w-3 text-primary-foreground" />
              </div>

              {/* Label */}
              <div className="p-2 rounded-md bg-card border shadow-sm">
                <p className="font-semibold text-xs text-foreground truncate">{station.name}</p>
              </div>

            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
