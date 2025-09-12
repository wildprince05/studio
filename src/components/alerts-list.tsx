import type { Conflict } from '@/lib/types';
import { ScrollArea } from './ui/scroll-area';
import { cn } from '@/lib/utils';
import { AlertTriangle } from 'lucide-react';

type AlertsListProps = {
  conflicts: Conflict[];
  activeConflictId?: string;
  onSelectConflict: (id: string) => void;
};

const severityStyles = {
  HIGH: {
    icon: 'text-red-500',
    border: 'border-red-500/50',
    bg: 'bg-red-500/10',
    activeBg: 'bg-red-500/20',
  },
  MEDIUM: {
    icon: 'text-yellow-500',
    border: 'border-yellow-500/50',
    bg: 'bg-yellow-500/10',
    activeBg: 'bg-yellow-500/20',
  },
  LOW: {
    icon: 'text-blue-500',
    border: 'border-blue-500/50',
    bg: 'bg-blue-500/10',
    activeBg: 'bg-blue-500/20',
  },
};

export function AlertsList({
  conflicts,
  activeConflictId,
  onSelectConflict,
}: AlertsListProps) {
  if (conflicts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground p-4">
        <p className="font-semibold">All Clear!</p>
        <p className="text-sm">No conflicts detected.</p>
      </div>
    );
  }
  return (
    <ScrollArea className="h-[calc(100vh-160px)]">
      <div className="space-y-2">
        {conflicts.map((conflict) => {
          const styles = severityStyles[conflict.severity];
          return (
            <button
              key={conflict.id}
              onClick={() => onSelectConflict(conflict.id)}
              className={cn(
                'w-full text-left p-3 rounded-lg border transition-colors flex items-start gap-3',
                styles.bg,
                styles.border,
                activeConflictId === conflict.id
                  ? styles.activeBg
                  : 'hover:bg-muted'
              )}
            >
              <AlertTriangle className={cn('h-5 w-5 flex-shrink-0 mt-0.5', styles.icon)} />
              <div>
                <p className="font-semibold text-sm">
                  {conflict.location}
                </p>
                <p className="text-xs text-muted-foreground line-clamp-2">
                  {conflict.description}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </ScrollArea>
  );
}
