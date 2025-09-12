'use client';

import { useState } from 'react';
import type {
  Train,
  Conflict,
  UserPreferences,
  Weather,
  Maintenance,
} from '@/lib/types';
import {
  initialTrains,
  initialPreferences,
  weatherData,
  maintenanceData,
} from '@/lib/data';
import { detectTrainConflicts } from '@/ai/flows/detect-train-conflicts';
import { useToast } from '@/hooks/use-toast';
import { DashboardLayout } from '@/components/dashboard-layout';

export default function Dashboard() {
  const { toast } = useToast();
  const [trains, setTrains] = useState<Train[]>(initialTrains);
  const [conflicts, setConflicts] = useState<Conflict[]>([]);
  const [preferences, setPreferences] =
    useState<UserPreferences>(initialPreferences);
  const [activeTrainId, setActiveTrainId] = useState<string | null>(null);
  const [activeConflictId, setActiveConflictId] = useState<string | null>(null);

  const [isDetecting, setIsDetecting] = useState(false);
  const [isSheetOpen, setIsSheetOpen] = useState<{
    train: boolean;
    conflict: boolean;
  }>({ train: false, conflict: false });

  const handleDetectConflicts = async () => {
    setIsDetecting(true);
    try {
      const scheduleData = JSON.stringify(trains);
      const weatherInfo = JSON.stringify(weatherData);
      const maintenanceInfo = JSON.stringify(maintenanceData);

      const result = await detectTrainConflicts({
        scheduleData,
        weatherData: weatherInfo,
        trackMaintenanceData: maintenanceInfo,
      });

      if (result.conflicts.length > 0) {
        const newConflicts = result.conflicts.map((c, index) => ({
          ...c,
          id: `conflict-${Date.now()}-${index}`,
        }));
        setConflicts(newConflicts);
        toast({
          title: 'Conflicts Detected',
          description: result.summary,
        });
      } else {
        setConflicts([]);
        toast({
          title: 'No Conflicts Found',
          description: 'The system scan completed successfully.',
        });
      }
    } catch (error) {
      console.error('Error detecting conflicts:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Could not detect conflicts. Please try again.',
      });
    } finally {
      setIsDetecting(false);
    }
  };

  const handleSelectTrain = (trainId: string | null) => {
    setActiveTrainId(trainId);
    if (trainId) {
      setActiveConflictId(null);
      setIsSheetOpen({ train: true, conflict: false });
    } else {
      setIsSheetOpen({ ...isSheetOpen, train: false });
    }
  };

  const handleSelectConflict = (conflictId: string | null) => {
    setActiveConflictId(conflictId);
    if (conflictId) {
      setActiveTrainId(null);
      setIsSheetOpen({ train: false, conflict: true });
    } else {
      setIsSheetOpen({ ...isSheetOpen, conflict: false });
    }
  };
  
  const handleSheetOpenChange = (type: 'train' | 'conflict', open: boolean) => {
    setIsSheetOpen(prev => ({ ...prev, [type]: open }));
    if (!open) {
      if (type === 'train') setActiveTrainId(null);
      if (type === 'conflict') setActiveConflictId(null);
    }
  };

  const activeTrain = trains.find((t) => t.id === activeTrainId);
  const activeConflict = conflicts.find((c) => c.id === activeConflictId);

  return (
    <DashboardLayout
      trains={trains}
      conflicts={conflicts}
      activeTrain={activeTrain}
      activeConflict={activeConflict}
      preferences={preferences}
      onUpdatePreferences={setPreferences}
      onSelectTrain={handleSelectTrain}
      onSelectConflict={handleSelectConflict}
      onDetectConflicts={handleDetectConflicts}
      isDetectingConflicts={isDetecting}
      isTrainSheetOpen={isSheetOpen.train}
      isConflictSheetOpen={isSheetOpen.conflict}
      onTrainSheetOpenChange={(open) => handleSheetOpenChange('train', open)}
      onConflictSheetOpenChange={(open) => handleSheetOpenChange('conflict', open)}
    />
  );
}
