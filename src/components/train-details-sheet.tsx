'use client';

import { useState, useEffect } from 'react';
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
  TrainFront,
  ShieldAlert,
} from 'lucide-react';
import { Button } from './ui/button';
import { Separator } from './ui/separator';
import { suggestAlternativeRoutes } from '@/ai/flows/suggest-alternative-routes';
import { predictDelay } from '@/ai/flows/predict-delay';
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
import { cn } from '@/lib/utils';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { RouteTimeline } from './route-timeline';

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
  const [isSuggestingRoutes, setIsSuggestingRoutes] = useState(false);
  const [isPredictingDelay, setIsPredictingDelay] = useState(false);
  const [routeResults, setRouteResults] = useState<{
    routes: string[];
    reasoning: string;
  } | null>(null);
  const [delayPrediction, setDelayPrediction] = useState<{
    predictedDelay: number;
    reasoning: string;
  } | null>(null);

  useEffect(() => {
    if (open) {
      setRouteResults(null);
      setDelayPrediction(null);
    }
  }, [open]);

  const handleSuggestRoutes = async () => {
    if (!train) return;
    setIsSuggestingRoutes(true);
    setRouteResults(null);
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
      setRouteResults({
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
      setIsSuggestingRoutes(false);
    }
  };

  const handlePredictDelay = async () => {
    if (!train) return;
    setIsPredictingDelay(true);
    setDelayPrediction(null);
    try {
      const response = await predictDelay({
        trainSchedule: JSON.stringify(train),
        weatherData: JSON.stringify(weather),
        trackMaintenanceData: JSON.stringify(maintenance),
      });
      setDelayPrediction(response);
    } catch (error) {
      console.error('Error predicting delay:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to predict delay.',
      });
    } finally {
      setIsPredictingDelay(false);
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
                <CardTitle className="text-xl flex items-center gap-2">
                  <Route /> Route Timeline
                </CardTitle>
              </CardHeader>
              <CardContent>
                <RouteTimeline train={train} />
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
              <h3 className="text-lg font-semibold mb-4">
                AI Assistance
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Button
                    onClick={handlePredictDelay}
                    disabled={isPredictingDelay}
                    variant="outline"
                  >
                    {isPredictingDelay ? (
                      <LoadingSpinner className="mr-2 h-4 w-4" />
                    ) : (
                      <ShieldAlert className="mr-2 h-4 w-4" />
                    )}
                    Predict Delay
                  </Button>
                <Button
                  onClick={handleSuggestRoutes}
                  disabled={isSuggestingRoutes}
                  variant="outline"
                >
                  {isSuggestingRoutes ? (
                    <LoadingSpinner className="mr-2 h-4 w-4" />
                  ) : (
                    <Sparkles className="mr-2 h-4 w-4" />
                  )}
                  Suggest Alternative Routes
                </Button>
              </div>
            </div>
            
            {delayPrediction && (
                <Alert>
                  <Sparkles className="h-4 w-4" />
                  <AlertTitle>AI Delay Prediction</AlertTitle>
                  <AlertDescription>
                    Predicted Delay: <strong>{delayPrediction.predictedDelay} minutes</strong>.
                    <p className="text-xs mt-2">{delayPrediction.reasoning}</p>
                  </AlertDescription>
                </Alert>
            )}

            {routeResults && (
              <Card className="bg-primary/5">
                <CardHeader>
                  <CardTitle className="text-xl flex items-center gap-2">
                    <Route /> Alternative Routes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 list-disc list-inside">
                    {routeResults.routes.map((route, index) => (
                      <li key={index} className="text-sm">
                        {route}
                      </li>
                    ))}
                  </ul>
                  <Separator className="my-4" />
                  <h4 className="font-semibold mb-2">Reasoning</h4>
                  <p className="text-sm text-muted-foreground">
                    {routeResults.reasoning}
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
