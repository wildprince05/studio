'use client';

import type { Train, Conflict, UserPreferences } from '@/lib/types';
import { useState } from 'react';
import {
  AlertTriangle,
  Settings,
  Sparkles,
  Train as TrainIcon,
} from 'lucide-react';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInset,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/logo';
import { TrainList } from '@/components/train-list';
import { AlertsList } from '@/components/alerts-list';
import { MapVisualization } from '@/components/map-visualization';
import { TrainDetailsSheet } from '@/components/train-details-sheet';
import { ConflictDetailsSheet } from '@/components/conflict-details-sheet';
import { UserPreferencesDialog } from '@/components/user-preferences-dialog';
import { LoadingSpinner } from '@/components/loading-spinner';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from './ui/card';

type DashboardLayoutProps = {
  trains: Train[];
  conflicts: Conflict[];
  activeTrain: Train | undefined;
  activeConflict: Conflict | undefined;
  preferences: UserPreferences;
  onUpdatePreferences: (preferences: UserPreferences) => void;
  onSelectTrain: (id: string | null) => void;
  onSelectConflict: (id: string | null) => void;
  onDetectConflicts: () => void;
  isDetectingConflicts: boolean;
  isTrainSheetOpen: boolean;
  isConflictSheetOpen: boolean;
  onTrainSheetOpenChange: (open: boolean) => void;
  onConflictSheetOpenChange: (open: boolean) => void;
};

export function DashboardLayout({
  trains,
  conflicts,
  activeTrain,
  activeConflict,
  preferences,
  onUpdatePreferences,
  onSelectTrain,
  onSelectConflict,
  onDetectConflicts,
  isDetectingConflicts,
  isTrainSheetOpen,
  isConflictSheetOpen,
  onTrainSheetOpenChange,
  onConflictSheetOpenChange,
}: DashboardLayoutProps) {
  const [isPrefsOpen, setIsPrefsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('trains');

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <Logo />
        </SidebarHeader>
        <SidebarContent className="p-0">
          <div className="flex flex-col">
            <div className="flex border-b">
              <Button
                variant="ghost"
                className={`flex-1 justify-center rounded-none border-b-2 ${
                  activeTab === 'trains'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground'
                }`}
                onClick={() => setActiveTab('trains')}
              >
                <TrainIcon className="mr-2 h-4 w-4" />
                Trains
              </Button>
              <Button
                variant="ghost"
                className={`flex-1 justify-center rounded-none border-b-2 ${
                  activeTab === 'alerts'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground'
                }`}
                onClick={() => setActiveTab('alerts')}
              >
                <AlertTriangle className="mr-2 h-4 w-4" />
                Alerts
                {conflicts.length > 0 && (
                  <span className="ml-2 flex h-5 w-5 items-center justify-center rounded-full bg-accent text-accent-foreground text-xs">
                    {conflicts.length}
                  </span>
                )}
              </Button>
            </div>
            <div className="p-2">
              {activeTab === 'trains' ? (
                <TrainList
                  trains={trains}
                  activeTrainId={activeTrain?.id}
                  onSelectTrain={onSelectTrain}
                />
              ) : (
                <AlertsList
                  conflicts={conflicts}
                  activeConflictId={activeConflict?.id}
                  onSelectConflict={onSelectConflict}
                />
              )}
            </div>
          </div>
        </SidebarContent>
        <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                onClick={() => setIsPrefsOpen(true)}
                tooltip="User Preferences"
              >
                <Settings />
                <span>Preferences</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>

      <SidebarInset>
        <div className="relative flex h-full min-h-svh flex-1 flex-col">
          <div className="absolute top-4 right-4 z-10">
            <Button
              size="lg"
              onClick={onDetectConflicts}
              disabled={isDetectingConflicts}
              className="shadow-lg"
            >
              {isDetectingConflicts ? (
                <LoadingSpinner className="mr-2 h-5 w-5" />
              ) : (
                <Sparkles className="mr-2 h-5 w-5" />
              )}
              Scan for Conflicts
            </Button>
          </div>

          {trains.length > 0 ? (
            <MapVisualization
              trains={trains}
              conflicts={conflicts}
              activeTrainId={activeTrain?.id}
              activeConflictId={activeConflict?.id}
              onSelectTrain={onSelectTrain}
            />
          ) : (
             <div className="flex h-full flex-1 items-center justify-center">
                <Card className="w-[380px]">
                  <CardHeader>
                    <CardTitle>No Trains Available</CardTitle>
                    <CardDescription>There are no trains to display on the map.</CardDescription>
                  </CardHeader>
                </Card>
             </div>
          )}
        </div>
      </SidebarInset>

      <TrainDetailsSheet
        train={activeTrain}
        weather={
          activeTrain
            ? weatherData.find((w) => activeTrain.route.includes(w.location))
            : undefined
        }
        maintenance={
          activeTrain
            ? maintenanceData.find((m) =>
                activeTrain.route.some((r, i) =>
                  i < activeTrain.route.length - 1
                    ? m.trackSegment.includes(`${r} -> ${activeTrain.route[i + 1]}`)
                    : false
                )
              )
            : undefined
        }
        open={isTrainSheetOpen}
        onOpenChange={onTrainSheetOpenChange}
      />

      <ConflictDetailsSheet
        conflict={activeConflict}
        preferences={preferences}
        open={isConflictSheetOpen}
        onOpenChange={onConflictSheetOpenChange}
      />

      <UserPreferencesDialog
        open={isPrefsOpen}
        onOpenChange={setIsPrefsOpen}
        preferences={preferences}
        onSave={onUpdatePreferences}
      />
    </SidebarProvider>
  );
}
