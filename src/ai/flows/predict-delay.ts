'use server';
/**
 * @fileOverview Predicts potential delays for a train based on various factors.
 *
 * - predictDelay - Function to predict train delays.
 * - PredictDelayInput - Input type for predictDelay.
 * - PredictDelayOutput - Output type for predictDelay.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const PredictDelayInputSchema = z.object({
  trainSchedule: z.string().describe('Current train schedule data in JSON format.'),
  weatherData: z.string().describe('Real-time weather data in JSON format.'),
  trackMaintenanceData: z.string().describe('Real-time track maintenance data in JSON format.'),
});
export type PredictDelayInput = z.infer<typeof PredictDelayInputSchema>;

const PredictDelayOutputSchema = z.object({
    predictedDelay: z.number().describe('The predicted delay in minutes.'),
    reasoning: z.string().describe('The reasoning for the predicted delay.'),
});
export type PredictDelayOutput = z.infer<typeof PredictDelayOutputSchema>;

export async function predictDelay(input: PredictDelayInput): Promise<PredictDelayOutput> {
  return predictDelayFlow(input);
}

const predictDelayPrompt = ai.definePrompt({
  name: 'predictDelayPrompt',
  input: {schema: PredictDelayInputSchema},
  output: {schema: PredictDelayOutputSchema},
  prompt: `You are an expert in railway logistics and delay prediction. Analyze the provided train schedule, weather data, and track maintenance data to predict any potential delays.

Train Schedule: {{{trainSchedule}}}
Weather Data: {{{weatherData}}}
Track Maintenance Data: {{{trackMaintenanceData}}}

Based on these factors, predict the potential delay in minutes for the train. Provide a brief reasoning for your prediction. If no delay is likely, return 0.
`, 
});

const predictDelayFlow = ai.defineFlow(
  {
    name: 'predictDelayFlow',
    inputSchema: PredictDelayInputSchema,
    outputSchema: PredictDelayOutputSchema,
  },
  async input => {
    const {output} = await predictDelayPrompt(input);
    return output!;
  }
);
