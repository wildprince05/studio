import type { Train } from '@/lib/types';
import { ScrollArea } from './ui/scroll-area';
import { cn } from '@/lib/utils';
import { Circle } from 'lucide-react';

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

export function TrainList({
  trains,
  activeTrainId,
  onSelectTrain,
}: TrainListProps) {
  if (trains.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground p-4">
        <p className="text-sm">No active trains.</p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-[calc(100vh-160px)]">
      <div className="space-y-2">
        {trains.map((train) => (
          <button
            key={train.id}
            onClick={() => onSelectTrain(train.id)}
            className={cn(
              'w-full text-left p-3 rounded-lg border transition-colors',
              activeTrainId === train.id
                ? 'bg-primary/10 border-primary'
                : 'bg-card hover:bg-muted'
            )}
          >
            <div className="flex justify-between items-center">
              <p className="font-semibold text-sm truncate">{train.name}</p>
              <div
                className={cn(
                  'flex items-center gap-1.5 text-xs',
                  statusColors[train.status]
                )}
              >
                <Circle className="h-2 w-2 fill-current" />
                <span>{train.status}</span>
              </div>
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              {train.origin} &rarr; {train.destination}
            </div>
          </button>
        ))}
      </div>
    </ScrollArea>
  );
}
