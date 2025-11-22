/**
 * @fileoverview A Genkit route handler for Next.js.
 */

import {createNextJsHandler} from '@genkit-ai/next';
import {ai} from '@/ai/genkit';
import '@/ai/dev';

export const {GET, POST} = createNextJsHandler(ai);
