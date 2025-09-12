'use server';
/**
 * @fileOverview This file defines a Genkit flow for generating optimal re-scheduling proposals to resolve train conflicts.
 *
 * - generateReSchedulingProposals - A function that takes conflict details and user preferences as input and returns a set of re-scheduling proposals.
 * - GenerateReSchedulingProposalsInput - The input type for the generateReSchedulingProposals function.
 * - GenerateReSchedulingProposalsOutput - The return type for the generateReSchedulingProposals function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateReSchedulingProposalsInputSchema = z.object({
  conflictDetails: z
    .string()
    .describe('Detailed information about the detected train conflict.'),
  userPreferences: z
    .string()
    .describe(
      'User preferences for re-scheduling, such as prioritizing certain trains or routes. Represented as a JSON string.'
    ),
  currentTime: z.string().describe('The current time, as an ISO string.'),
});
export type GenerateReSchedulingProposalsInput = z.infer<
  typeof GenerateReSchedulingProposalsInputSchema
>;

const GenerateReSchedulingProposalsOutputSchema = z.object({
  proposals: z
    .string()
    .describe(
      'A JSON array of re-scheduling proposals, each containing details such as new train schedules and affected routes.'
    ),
  reasoning: z
    .string()
    .describe('The AI agents reasoning for the proposed re-schedules'),
});
export type GenerateReSchedulingProposalsOutput = z.infer<
  typeof GenerateReSchedulingProposalsOutputSchema
>;

export async function generateReSchedulingProposals(
  input: GenerateReSchedulingProposalsInput
): Promise<GenerateReSchedulingProposalsOutput> {
  return generateReSchedulingProposalsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateReSchedulingProposalsPrompt',
  input: {schema: GenerateReSchedulingProposalsInputSchema},
  output: {schema: GenerateReSchedulingProposalsOutputSchema},
  prompt: `You are an expert in train scheduling and logistics. Given the current train conflict details, user preferences, and current time, generate optimal re-scheduling proposals to resolve the conflict while minimizing delays and respecting user preferences.

Current Time: {{{currentTime}}}
Conflict Details: {{{conflictDetails}}}
User Preferences: {{{userPreferences}}}

Consider various factors such as train priorities, route availability, and potential alternative routes. Provide a JSON array of re-scheduling proposals, each containing details such as new train schedules and affected routes. Explain your reasoning.

Make sure the proposals are in JSON format and can be parsed by Javascript's JSON.parse function.
`,
});

const generateReSchedulingProposalsFlow = ai.defineFlow(
  {
    name: 'generateReSchedulingProposalsFlow',
    inputSchema: GenerateReSchedulingProposalsInputSchema,
    outputSchema: GenerateReSchedulingProposalsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
