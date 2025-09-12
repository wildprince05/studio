'use client';

import { useState, useEffect } from 'react';
import type { UserPreferences } from '@/lib/types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from './ui/button';
import { Label } from './ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { Checkbox } from './ui/checkbox';

type UserPreferencesDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  preferences: UserPreferences;
  onSave: (newPreferences: UserPreferences) => void;
};

export function UserPreferencesDialog({
  open,
  onOpenChange,
  preferences,
  onSave,
}: UserPreferencesDialogProps) {
  const [currentPrefs, setCurrentPrefs] = useState(preferences);

  useEffect(() => {
    setCurrentPrefs(preferences);
  }, [preferences, open]);

  const handleSave = () => {
    onSave(currentPrefs);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>User Preferences</DialogTitle>
          <DialogDescription>
            Set your preferences for AI-powered re-scheduling and routing.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-6 py-4">
          <div className="grid gap-2">
            <Label htmlFor="prioritize">Prioritize Train Type</Label>
            <Select
              value={currentPrefs.prioritize}
              onValueChange={(value) =>
                setCurrentPrefs({
                  ...currentPrefs,
                  prioritize: value as UserPreferences['prioritize'],
                })
              }
            >
              <SelectTrigger id="prioritize">
                <SelectValue placeholder="Select a type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="passenger">Passenger</SelectItem>
                <SelectItem value="cargo">Cargo</SelectItem>
                <SelectItem value="high-speed">High-Speed</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label>Avoid in Routes</Label>
            <div className="space-y-2 mt-2">
              {(['tunnels', 'bridges', 'steep-grades'] as const).map((item) => (
                <div key={item} className="flex items-center space-x-2">
                  <Checkbox
                    id={item}
                    checked={currentPrefs.avoid.includes(item)}
                    onCheckedChange={(checked) => {
                      const newAvoid = checked
                        ? [...currentPrefs.avoid, item]
                        : currentPrefs.avoid.filter((i) => i !== item);
                      setCurrentPrefs({ ...currentPrefs, avoid: newAvoid });
                    }}
                  />
                  <label
                    htmlFor={item}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 capitalize"
                  >
                    {item.replace('-', ' ')}
                  </label>
                </div>
              ))}
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save Preferences</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
