'use server';
/**
 * @fileOverview A simple text generation flow.
 *
 * - simpleText - A function that handles simple text generation.
 * - SimpleTextInput - The input type for the simpleText function.
 * - SimpleTextOutput - The return type for the simpleText function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SimpleTextInputSchema = z.object({
  prompt: z.string().describe('The user\'s prompt.'),
});
export type SimpleTextInput = z.infer<typeof SimpleTextInputSchema>;

const SimpleTextOutputSchema = z.object({
  response: z.string().describe('The AI\'s response.'),
});
export type SimpleTextOutput = z.infer<typeof SimpleTextOutputSchema>;

export async function simpleText(input: SimpleTextInput): Promise<SimpleTextOutput> {
  return simpleTextFlow(input);
}

const prompt = ai.definePrompt({
  name: 'simpleTextPrompt',
  input: {schema: SimpleTextInputSchema},
  output: {schema: SimpleTextOutputSchema},
  prompt: `You are a helpful assistant. Please respond to the user's prompt.

Prompt: {{{prompt}}}`,
});

const simpleTextFlow = ai.defineFlow(
  {
    name: 'simpleTextFlow',
    inputSchema: SimpleTextInputSchema,
    outputSchema: SimpleTextOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
