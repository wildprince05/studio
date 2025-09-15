'use server';

/**
 * @fileOverview An AI agent for suggesting alternative routes for trains to avoid delays or conflicts.
 *
 * - suggestAlternativeRoutes - A function that handles the process of suggesting alternative routes.
 * - SuggestAlternativeRoutesInput - The input type for the suggestAlternativeRoutes function.
 * - SuggestAlternativeRoutesOutput - The return type for the suggestAlternativeRoutes function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestAlternativeRoutesInputSchema = z.object({
  currentRoute: z.string().describe('The current route of the train.'),
  trainSchedule: z.string().describe('The current schedule of the train.'),
  weatherConditions: z.string().describe('The current weather conditions.'),
  trackMaintenance: z.string().describe('Information about any track maintenance.'),
  delayReason: z.string().describe('The reason for the potential delay or conflict.'),
});
export type SuggestAlternativeRoutesInput = z.infer<
  typeof SuggestAlternativeRoutesInputSchema
>;

const SuggestAlternativeRoutesOutputSchema = z.object({
  alternativeRoutes: z
    .array(z.string())
    .describe('A list of suggested alternative routes.'),
  reasoning: z
    .string()
    .describe(
      'The AI reasoning behind suggesting these alternative routes, including the advantages of each route given the current conditions.'
    ),
});
export type SuggestAlternativeRoutesOutput = z.infer<
  typeof SuggestAlternativeRoutesOutputSchema
>;

export async function suggestAlternativeRoutes(
  input: SuggestAlternativeRoutesInput
): Promise<SuggestAlternativeRoutesOutput> {
  return suggestAlternativeRoutesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestAlternativeRoutesPrompt',
  input: {schema: SuggestAlternativeRoutesInputSchema},
  output: {schema: SuggestAlternativeRoutesOutputSchema},
  prompt: `You are an expert in train scheduling and route optimization. Given the current train route, schedule, weather conditions, track maintenance, and the reason for a potential delay, suggest alternative routes that would avoid the delay and optimize the train's schedule.

Current Route: {{{currentRoute}}}
Train Schedule: {{{trainSchedule}}}
Weather Conditions: {{{weatherConditions}}}
Track Maintenance: {{{trackMaintenance}}}
Reason for Delay: {{{delayReason}}}

Consider multiple variables to determine the best alternative routes, and explain the reasoning behind your suggestions. Return at least one possible alternative route.

Output format: An array of string representing alternative routes and a field explaining the reasoning behind the suggested routes.
`,
});

const suggestAlternativeRoutesFlow = ai.defineFlow(
  {
    name: 'suggestAlternativeRoutesFlow',
    inputSchema: SuggestAlternativeRoutesInputSchema,
    outputSchema: SuggestAlternativeRoutesOutputSchema,
  },
  async input => {
    try {
      const {output} = await prompt(input);
      if (!output || !Array.isArray(output.alternativeRoutes)) {
        return {
          alternativeRoutes: [],
          reasoning:
            'The model could not suggest any alternative routes at this time.',
        };
      }
      return output;
    } catch (error) {
      console.error('Error in suggestAlternativeRoutesFlow:', error);
      return {
        alternativeRoutes: [],
        reasoning: 'An error occurred while suggesting alternative routes.',
      };
    }
  }
);
