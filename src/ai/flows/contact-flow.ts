'use server';
/**
 * @fileOverview A flow to handle contact form submissions.
 *
 * - handleContactMessage - Saves the message to Firestore and logs it as if sending an email.
 * - ContactMessageInput - The input type for the flow.
 * - ContactMessageOutput - The return type for the flow.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { getFirestore, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { initializeFirebase } from '@/lib/firebase/config';

// Initialize Firebase Admin for server-side operations
const { db } = initializeFirebase();

const ContactMessageInputSchema = z.object({
  name: z.string().describe("The sender's name."),
  email: z.string().email().describe("The sender's email address."),
  message: z.string().describe('The content of the message.'),
});
export type ContactMessageInput = z.infer<typeof ContactMessageInputSchema>;

const ContactMessageOutputSchema = z.object({
  success: z.boolean(),
  message: z.string(),
});
export type ContactMessageOutput = z.infer<typeof ContactMessageOutputSchema>;

export async function handleContactMessage(input: ContactMessageInput): Promise<ContactMessageOutput> {
  return contactFlow(input);
}

const contactFlow = ai.defineFlow(
  {
    name: 'contactFlow',
    inputSchema: ContactMessageInputSchema,
    outputSchema: ContactMessageOutputSchema,
  },
  async (input) => {
    try {
      if (!db) {
        throw new Error('Firestore is not initialized.');
      }
      
      // 1. Save the message to Firestore
      const docRef = await addDoc(collection(db, "contacts"), {
        ...input,
        createdAt: serverTimestamp(),
      });
      console.log("Message saved to Firestore with ID:", docRef.id);

      // 2. "Send" the email by logging it to the console
      console.log("--- Sending Email ---");
      console.log(`To: admin@example.com`);
      console.log(`From: ${input.email}`);
      console.log(`Name: ${input.name}`);
      console.log(`Message: ${input.message}`);
      console.log("---------------------");

      return {
        success: true,
        message: 'Message sent successfully!',
      };
    } catch (error: any) {
      console.error('Error in contact flow:', error);
      return {
        success: false,
        message: error.message || 'An unexpected error occurred.',
      };
    }
  }
);
