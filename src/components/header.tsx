'use client';
import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Bell, RefreshCw, Zap } from 'lucide-react';
import { Logo } from './logo';

export function Header() {
  const [time, setTime] = useState<string | null>(null);

  useEffect(() => {
    const updateIndianTime = () => {
      const now = new Date();
      const indianTime = now.toLocaleTimeString('en-IN', {
        timeZone: 'Asia/Kolkata',
        hour12: false,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });
      setTime(indianTime);
    };

    updateIndianTime();
    const timer = setInterval(updateIndianTime, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
            <div className="w-10 h-10 bg-primary/10 border border-primary/20 rounded-lg flex items-center justify-center">
                <Logo className="text-primary" />
            </div>
            AI Rail Operations Control
        </h1>
        <p className="text-muted-foreground">
          Real-time conflict detection and intelligent scheduling
        </p>
      </div>
      <div className="flex items-center gap-4">
        <div className="text-right">
          <p className="text-sm text-muted-foreground">System Time (IST)</p>
          <p className="font-mono font-semibold text-lg h-6">
            {time || ''}
          </p>
        </div>
        <div className="flex items-center gap-2">
            <Button variant="outline" size="icon">
                <RefreshCw className="h-4 w-4" />
            </Button>
             <Button variant="outline" size="icon">
                <Bell className="h-4 w-4" />
            </Button>
             <Button variant="outline" size="icon">
                <Zap className="h-4 w-4" />
            </Button>
        </div>
      </div>
    </header>
  );
}
