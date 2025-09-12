'use client';

import { useState } from 'react';
import type { Conflict, UserPreferences, ReschedulingProposal } from '@/lib/types';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import {
  AlertTriangle,
  Clock,
  MapPin,
  Sparkles,
  Users,
} from 'lucide-react';
import { Button } from './ui/button';
import { Separator } from './ui/separator';
import { generateReSchedulingProposals } from '@/ai/flows/generate-re-scheduling-proposals';
import { useToast } from '@/hooks/use-toast';
import { LoadingSpinner } from './loading-spinner';
import { Badge } from './ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

type ConflictDetailsSheetProps = {
  conflict?: Conflict;
  preferences: UserPreferences;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function ConflictDetailsSheet({
  conflict,
  preferences,
  open,
  onOpenChange,
}: ConflictDetailsSheetProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [proposals, setProposals] = useState<ReschedulingProposal[]>([]);
  const [reasoning, setReasoning] = useState('');

  const handleGenerateProposals = async () => {
    if (!conflict) return;
    setIsLoading(true);
    setProposals([]);
    setReasoning('');

    try {
      const response = await generateReSchedulingProposals({
        conflictDetails: JSON.stringify(conflict),
        userPreferences: JSON.stringify(preferences),
        currentTime: new Date().toISOString(),
      });

      const parsedProposals = JSON.parse(response.proposals);
      setProposals(parsedProposals);
      setReasoning(response.reasoning);

    } catch (error) {
      console.error('Error generating proposals:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to generate re-scheduling proposals.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!conflict) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-lg w-full p-0">
        <div className="flex flex-col h-full">
          <SheetHeader className="p-6">
            <SheetTitle className="flex items-center gap-2 text-2xl">
              <AlertTriangle className="text-accent h-7 w-7" />
              Conflict Detected
            </SheetTitle>
            <SheetDescription>{conflict.description}</SheetDescription>
          </SheetHeader>
          <div className="flex-1 overflow-y-auto p-6 pt-0 space-y-6">
            <Card>
              <CardContent className="pt-6 space-y-4">
                <InfoItem icon={MapPin} label="Location" value={conflict.location} />
                <InfoItem icon={Clock} label="Est. Time" value={new Date(conflict.time).toLocaleTimeString()} />
                <InfoItem icon={Users} label="Involved" value={`${conflict.trainId1}, ${conflict.trainId2}`} />
                 <InfoItem icon={AlertTriangle} label="Severity" value={<Badge variant={conflict.severity === 'HIGH' ? 'destructive' : 'default'} className={conflict.severity === 'MEDIUM' ? 'bg-yellow-500' : ''}>{conflict.severity}</Badge>} />
              </CardContent>
            </Card>

            <Separator />
            
            <div>
              <h3 className="text-lg font-semibold mb-2">Resolve Conflict</h3>
              <Button onClick={handleGenerateProposals} disabled={isLoading} className="w-full">
                {isLoading ? (
                  <LoadingSpinner className="mr-2 h-4 w-4" />
                ) : (
                  <Sparkles className="mr-2 h-4 w-4" />
                )}
                Generate Re-scheduling Proposals
              </Button>
            </div>
            
            {proposals.length > 0 && (
              <Card className="bg-primary/5">
                <CardHeader>
                  <CardTitle className="text-xl">AI-Generated Proposals</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {proposals.map((proposal, index) => (
                    <Card key={index}>
                      <CardHeader>
                        <CardTitle className="text-base">Proposal for {proposal.trainId}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm"><strong>New Departure:</strong> {new Date(proposal.newDepartureTime).toLocaleTimeString()}</p>
                        <p className="text-sm"><strong>New Arrival:</strong> {new Date(proposal.newArrivalTime).toLocaleTimeString()}</p>
                        <p className="text-sm mt-2 text-muted-foreground">{proposal.reason}</p>
                      </CardContent>
                    </Card>
                  ))}
                   <Separator className="my-4" />
                  <h4 className="font-semibold mb-2">Reasoning</h4>
                  <p className="text-sm text-muted-foreground">{reasoning}</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function InfoItem({ icon: Icon, label, value }: { icon: React.ElementType, label: string, value: React.ReactNode }) {
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
