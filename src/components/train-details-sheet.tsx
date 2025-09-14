'use client';

import { useState } from 'react';
import type { Train, Weather, Maintenance } from '@/lib/types';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import {
  Clock,
  MapPin,
  Route,
  Sparkles,
  Thermometer,
  Wind,
  Wrench,
  Gauge,
} from 'lucide-react';
import { Button } from './ui/button';
import { Separator } from './ui/separator';
import { suggestAlternativeRoutes } from '@/ai/flows/suggest-alternative-routes';
import { useToast } from '@/hooks/use-toast';
import { LoadingSpinner } from './loading-spinner';
import { Badge } from './ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from './ui/card';

type TrainDetailsSheetProps = {
  train?: Train;
  weather?: Weather;
  maintenance?: Maintenance;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function TrainDetailsSheet({
  train,
  weather,
  maintenance,
  open,
  onOpenChange,
}: TrainDetailsSheetProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<{
    routes: string[];
    reasoning: string;
  } | null>(null);

  const handleSuggestRoutes = async () => {
    if (!train) return;
    setIsLoading(true);
    setResults(null);
    try {
      const response = await suggestAlternativeRoutes({
        currentRoute: train.route.join(' -> '),
        trainSchedule: `Departs: ${train.departureTime}, Arrives: ${train.arrivalTime}`,
        weatherConditions: weather
          ? `${weather.condition} at ${weather.location}`
          : 'Normal',
        trackMaintenance: maintenance
          ? `${maintenance.description} on ${maintenance.trackSegment}`
          : 'None',
        delayReason: 'Potential congestion and maintenance work ahead.',
      });
      setResults({
        routes: response.alternativeRoutes,
        reasoning: response.reasoning,
      });
    } catch (error) {
      console.error('Error suggesting routes:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to suggest alternative routes.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!train) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-2xl w-full">
        <div className="flex flex-col h-full">
          <SheetHeader className="p-6">
            <SheetTitle className="flex items-center gap-2 text-2xl">
              {train.name}
            </SheetTitle>
            <SheetDescription>
              {train.origin} &rarr; {train.destination}
            </SheetDescription>
          </SheetHeader>
          <div className="flex-1 overflow-y-auto p-6 pt-0 space-y-6">
            <Card>
              <CardContent className="pt-6 space-y-4">
                <InfoItem
                  icon={MapPin}
                  label="Status"
                  value={
                    <Badge
                      variant={
                        train.status === 'On Time' ? 'default' : 'destructive'
                      }
                      className={train.status === 'On Time' ? 'bg-green-600' : ''}
                    >
                      {train.status}
                    </Badge>
                  }
                />
                <InfoItem
                  icon={Clock}
                  label="Departure"
                  value={new Date(train.departureTime).toLocaleTimeString()}
                />
                <InfoItem
                  icon={Clock}
                  label="Arrival"
                  value={new Date(train.arrivalTime).toLocaleTimeString()}
                />
                {train.currentSpeed && (
                  <InfoItem
                    icon={Gauge}
                    label="Current Speed"
                    value={`${train.currentSpeed} km/h`}
                  />
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Live Conditions</CardTitle>
              </CardHeader>
              <CardContent>
                {weather && (
                  <div className="space-y-2">
                    <InfoItem
                      icon={Wind}
                      label="Weather"
                      value={`${weather.condition} at ${weather.location}`}
                    />
                    <InfoItem
                      icon={Thermometer}
                      label="Temperature"
                      value={`${weather.temperature}°C`}
                    />
                  </div>
                )}
                {maintenance && (
                  <div className="mt-4 space-y-2">
                    <InfoItem
                      icon={Wrench}
                      label="Maintenance"
                      value={`${maintenance.description} on ${maintenance.trackSegment}`}
                    />
                  </div>
                )}
                {!weather && !maintenance && (
                  <p className="text-sm text-muted-foreground">
                    No adverse conditions reported.
                  </p>
                )}
              </CardContent>
            </Card>

            <Separator />

            <div>
              <h3 className="text-lg font-semibold mb-2">
                Route Optimization
              </h3>
              <Button
                onClick={handleSuggestRoutes}
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? (
                  <LoadingSpinner className="mr-2 h-4 w-4" />
                ) : (
                  <Sparkles className="mr-2 h-4 w-4" />
                )}
                Suggest Alternative Routes
              </Button>
            </div>

            {results && (
              <Card className="bg-primary/5">
                <CardHeader>
                  <CardTitle className="text-xl flex items-center gap-2">
                    <Route /> Alternative Routes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 list-disc list-inside">
                    {results.routes.map((route, index) => (
                      <li key={index} className="text-sm">
                        {route}
                      </li>
                    ))}
                  </ul>
                  <Separator className="my-4" />
                  <h4 className="font-semibold mb-2">Reasoning</h4>
                  <p className="text-sm text-muted-foreground">
                    {results.reasoning}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function InfoItem({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between text-sm">
      <div className="flex items-center gap-2 text-muted-foreground">
        <Icon className="h-4 w-4" />
        <span>{label}</span>
      </div>
      <span className="font-medium text-right">{value}</span>
    </div>
  );
}
