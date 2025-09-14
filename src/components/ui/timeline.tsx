
import * as React from 'react';
import { cn } from '@/lib/utils';

const Timeline = React.forwardRef<
  HTMLOListElement,
  React.HTMLAttributes<HTMLOListElement>
>(({ className, ...props }, ref) => (
  <ol ref={ref} className={cn('flex flex-col', className)} {...props} />
));
Timeline.displayName = 'Timeline';

const TimelineItem = React.forwardRef<
  HTMLLIElement,
  React.LiHTMLAttributes<HTMLLIElement>
>(({ className, children, ...props }, ref) => (
  <li
    ref={ref}
    className={cn(
      'relative flex items-center gap-6 pb-8 last:pb-0',
      className
    )}
    {...props}
  >
    <div className="absolute left-3 top-3 h-full w-px bg-border" />
    <div className="relative z-10 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 border-primary bg-background">
      <div className="h-2 w-2 rounded-full bg-primary" />
    </div>
    {children}
  </li>
));
TimelineItem.displayName = 'TimelineItem';

export { Timeline, TimelineItem };
