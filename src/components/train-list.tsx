import type { Train } from '@/lib/types';
import { ScrollArea } from './ui/scroll-area';
import { cn } from '@/lib/utils';
import { Circle, TrainFront } from 'lucide-react';
import { useMemo } from 'react';

type TrainListProps = {
  trains: Train[];
  activeTrainId?: string;
  onSelectTrain: (id: string) => void;
};

const statusColors = {
  'On Time': 'text-green-500',
  Delayed: 'text-yellow-500',
  Cancelled: 'text-red-500',
};

const trainTypeIcons = {
  Express: <TrainFront className="h-4 w-4 text-blue-400" />,
  Liner: <TrainFront className="h-4 w-4 text-green-400" />,
  Hauler: <TrainFront className="h-4 w-4 text-amber-400" />,
  Cargo: <TrainFront className="h-4 w-4 text-accent" />,
  Passenger: <TrainFront className="h-4 w-4 text-primary" />,
  'High-Speed': <TrainFront className="h-4 w-4 text-purple-400" />,
}

export function TrainList({
  trains,
  activeTrainId,
  onSelectTrain,
}: TrainListProps) {

  const groupedTrains = useMemo(() => {
    return trains.reduce((acc, train) => {
      const { type } = train;
      if (!acc[type]) {
        acc[type] = [];
      }
      acc[type].push(train);
      return acc;
    }, {} as Record<Train['type'], Train[]>);
  }, [trains]);
  
  if (trains.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground p-4">
        <p className="text-sm">No active trains.</p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-[calc(100vh-160px)]">
      <div className="space-y-4">
      {Object.entries(groupedTrains).map(([type, trainsInGroup]) => (
        <div key={type}>
            <h3 className="px-3 text-xs font-semibold uppercase text-muted-foreground tracking-wider mb-2 flex items-center gap-2">
              {trainTypeIcons[type as Train['type']]}
              {type}
            </h3>
            <div className="space-y-2">
              {trainsInGroup.map((train) => {
                const trainColor = train.type === 'Cargo' ? 'border-accent' : 'border-primary';
                return (
                <button
                  key={train.id}
                  onClick={() => onSelectTrain(train.id)}
                  className={cn(
                    'w-full text-left p-3 rounded-lg border-l-4 transition-colors',
                    activeTrainId === train.id
                      ? `bg-primary/10 ${trainColor}`
                      : `bg-card hover:bg-muted ${trainColor}`
                  )}
                >
                  <div className="flex justify-between items-center">
                    <p className="font-semibold text-sm truncate">{train.name}</p>
                    <div
                      className={cn(
                        'flex items-center gap-1.5 text-xs font-medium',
                        train.delay > 0 ? statusColors.Delayed : statusColors['On Time']
                      )}
                    >
                      <Circle className="h-2 w-2 fill-current" />
                      <span>{train.delay > 0 ? `+${train.delay}min` : 'On Time'}</span>
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {train.origin} &rarr; {train.destination}
                  </div>
                </button>
              )})}
            </div>
        </div>
      ))}
      </div>
    </ScrollArea>
  );
}
