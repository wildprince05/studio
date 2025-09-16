'use server';
/**
 * @fileOverview Detects potential train conflicts based on schedules and real-time data.
 *
 * - detectTrainConflicts - Function to detect train conflicts.
 * - DetectTrainConflictsInput - Input type for detectTrainConflicts.
 * - DetectTrainConflictsOutput - Output type for detectTrainConflicts.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const DetectTrainConflictsInputSchema = z.object({
  scheduleData: z.string().describe('Current train schedule data in JSON format.'),
  weatherData: z.string().describe('Real-time weather data in JSON format.'),
  trackMaintenanceData: z.string().describe('Real-time track maintenance data in JSON format.'),
});
export type DetectTrainConflictsInput = z.infer<typeof DetectTrainConflictsInputSchema>;

const ConflictSchema = z.object({
  trainId1: z.string().describe('ID of the first train involved in the conflict.'),
  trainId2: z.string().describe('ID of the second train involved in the conflict.'),
  location: z.string().describe('Location of the potential conflict.'),
  time: z.string().describe('Estimated time of the potential conflict.'),
  severity: z.enum(['LOW', 'MEDIUM', 'HIGH']).describe('Severity level of the conflict.'),
  description: z.string().describe('A detailed description of the potential conflict.'),
});

const DetectTrainConflictsOutputSchema = z.object({
  conflicts: z.array(ConflictSchema).describe('Array of detected potential train conflicts.'),
  summary: z.string().describe('A summary of the detected conflicts.'),
});
export type DetectTrainConflictsOutput = z.infer<typeof DetectTrainConflictsOutputSchema>;

export async function detectTrainConflicts(input: DetectTrainConflictsInput): Promise<DetectTrainConflictsOutput> {
  return detectTrainConflictsFlow(input);
}

const detectTrainConflictsPrompt = ai.definePrompt({
  name: 'detectTrainConflictsPrompt',
  input: {schema: DetectTrainConflictsInputSchema},
  output: {schema: DetectTrainConflictsOutputSchema},
  model: 'googleai/gemini-2.5-flash-grounded',
  prompt: `You are an expert in detecting potential train conflicts based on schedule data, weather data, and track maintenance data. Analyze the provided data and identify any potential conflicts between trains.

Schedule Data: {{{scheduleData}}}
Weather Data: {{{weatherData}}}
Track Maintenance Data: {{{trackMaintenanceData}}}

Consider factors such as train speeds, routes, weather conditions, and track maintenance schedules to determine potential conflicts.  If the provided data contains no conflicts, return an empty list for conflicts.

Output the results in JSON format, including a summary of the detected conflicts.
`, 
});

const detectTrainConflictsFlow = ai.defineFlow(
  {
    name: 'detectTrainConflictsFlow',
    inputSchema: DetectTrainConflictsInputSchema,
    outputSchema: DetectTrainConflictsOutputSchema,
  },
  async input => {
    try {
      const {output} = await detectTrainConflictsPrompt(input);
      
      if (!output || !Array.isArray(output.conflicts)) {
        return {
          conflicts: [],
          summary: 'No conflicts were detected during the scan.',
        };
      }
      
      return output;
    } catch (error) {
       console.error('Error in detectTrainConflictsFlow:', error);
       return {
        conflicts: [],
        summary: 'An error occurred while detecting conflicts.',
      };
    }
  }
);
