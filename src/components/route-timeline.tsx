'use client';

import type { Train } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Circle, ArrowDown } from 'lucide-react';

type RouteTimelineProps = {
  train: Train;
};

// Helper function to generate mock schedule data for the timeline
const generateTimelineData = (train: Train) => {
  const departure = new Date(train.departureTime);
  const arrival = new Date(train.arrivalTime);
  const totalDurationMinutes =
    (arrival.getTime() - departure.getTime()) / (1000 * 60);
  const segmentDuration = totalDurationMinutes / (train.route.length - 1);

  let cumulativeDistance = 0;
  const distanceSegment = 250 / (train.route.length - 1); // Mock total distance

  return train.route.map((station, index) => {
    const stationTime = new Date(
      departure.getTime() + index * segmentDuration * 60 * 1000
    );
    const arrivalTime =
      index === 0
        ? null
        : new Date(stationTime.getTime() - 2 * 60 * 1000).toLocaleTimeString(
            [],
            { hour: '2-digit', minute: '2-digit' }
          );
    const departureTime =
      index === train.route.length - 1
        ? null
        : new Date(stationTime.getTime()).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          });

    if (index > 0) {
      cumulativeDistance += distanceSegment + Math.random() * 20 - 10;
    }

    return {
      name: station,
      arrivalTime,
      departureTime,
      distance: Math.round(cumulativeDistance),
      isLast: index === train.route.length - 1,
      isFirst: index === 0,
    };
  });
};

export function RouteTimeline({ train }: RouteTimelineProps) {
  const timelineData = generateTimelineData(train);

  return (
    <div className="flow-root">
      <ul className="-mb-8">
        {timelineData.map((station, stationIdx) => (
          <li key={station.name}>
            <div className="relative pb-8">
              {stationIdx !== timelineData.length - 1 ? (
                <span
                  className="absolute left-4 top-4 -ml-px h-full w-0.5 bg-primary/50"
                  aria-hidden="true"
                />
              ) : null}
              <div className="relative flex items-start space-x-3">
                <div>
                  <div
                    className={cn(
                      'h-8 w-8 rounded-full bg-primary flex items-center justify-center ring-8 ring-card',
                      {
                        'bg-green-500':
                          train.status === 'On Time' &&
                          (station.isFirst || station.isLast),
                      }
                    )}
                  >
                    <Circle className="h-3 w-3 text-primary-foreground" />
                  </div>
                </div>
                <div className="min-w-0 flex-1 flex justify-between items-center pr-4">
                  <div>
                    <p className="font-semibold text-foreground">
                      {station.name}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {station.distance > 0 && `${station.distance} km`}
                    </p>
                  </div>
                  <div className="text-right text-sm">
                    <p>
                      <span className="text-muted-foreground">Arr: </span>
                      <span className="font-medium">
                        {station.arrivalTime ?? '--:--'}
                      </span>
                    </p>
                    <p>
                      <span className="text-muted-foreground">Dep: </span>
                      <span className="font-medium">
                        {station.departureTime ?? '--:--'}
                      </span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
