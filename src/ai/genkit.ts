import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/google-genai';
import {toNextJs} from '@genkit-ai/next';

export const ai = toNextJs({
  plugins: [googleAI()],
  model: 'googleai/gemini-2.5-flash',
});
