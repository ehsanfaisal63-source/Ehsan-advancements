'use server';
/**
 * @fileOverview An AI flow to generate project details from a user prompt.
 *
 * - generateProjectDetails - A function that creates structured project data.
 * - ProjectPromptInput - The input type for the flow.
 * - ProjectDetailsOutput - The return type for the flow.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const ProjectPromptInputSchema = z.object({
  prompt: z.string().describe("The user's description of the project they want to create."),
});
export type ProjectPromptInput = z.infer<typeof ProjectPromptInputSchema>;

const ProjectDetailsOutputSchema = z.object({
  name: z.string().describe('A concise and clear name for the project, derived from the user prompt.'),
  description: z.string().describe('A one or two sentence description of the project.'),
  status: z.enum(['Not Started', 'In Progress', 'Completed']).describe('The current status of the project. Default to "Not Started" unless specified otherwise.'),
});
export type ProjectDetailsOutput = z.infer<typeof ProjectDetailsOutputSchema>;

export async function generateProjectDetails(input: ProjectPromptInput): Promise<ProjectDetailsOutput> {
  return projectGenerationFlow(input);
}

const projectPrompt = ai.definePrompt({
  name: 'projectPrompt',
  input: { schema: ProjectPromptInputSchema },
  output: { schema: ProjectDetailsOutputSchema },
  prompt: `You are an expert project manager. A user will provide a prompt describing a project.
Your task is to analyze the prompt and extract the following information:
1. A clear and concise project 'name'.
2. A one or two sentence 'description' of the project.
3. The project's current 'status'. The options are "Not Started", "In Progress", or "Completed". Default to "Not Started" if the user does not specify a status.

Analyze the user's prompt carefully to generate the most accurate project details.

User Prompt: {{{prompt}}}
`,
});

const projectGenerationFlow = ai.defineFlow(
  {
    name: 'projectGenerationFlow',
    inputSchema: ProjectPromptInputSchema,
    outputSchema: ProjectDetailsOutputSchema,
  },
  async (input) => {
    const { output } = await projectPrompt(input);
    if (!output) {
      throw new Error("The AI model could not generate project details from the prompt.");
    }
    return output;
  }
);
