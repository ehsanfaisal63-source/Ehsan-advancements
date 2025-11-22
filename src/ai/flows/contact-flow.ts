
'use server';
/**
 * @fileOverview A flow to handle contact form submissions.
 *
 * - handleContactMessage - Saves the message to Firestore and sends an email via Resend.
 * - ContactMessageInput - The input type for the flow.
 * - ContactMessageOutput - The return type for the flow.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { getFirestore as getAdminFirestore } from 'firebase-admin/firestore';
import { initializeApp as initializeAdminApp, getApps as getAdminApps, getApp as getAdminApp, type App as AdminApp, credential } from 'firebase-admin/app';
import { Resend } from 'resend';

// Initialize Firebase Admin SDK for server-side operations
let db: ReturnType<typeof getAdminFirestore>;

if (!getAdminApps().length) {
  const adminApp = initializeAdminApp({
    credential: credential.applicationDefault(),
  });
  db = getAdminFirestore(adminApp);
} else {
  const adminApp = getAdminApp();
  db = getAdminFirestore(adminApp);
}


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
      const docRef = await db.collection("contacts").add({
        ...input,
        createdAt: new Date(),
      });
      console.log("Message saved to Firestore with ID:", docRef.id);

      // 2. Send the email using Resend
      const resend = new Resend(process.env.RESEND_API_KEY);

      await resend.emails.send({
        from: 'onboarding@resend.dev', // This must be a domain you have verified with Resend
        to: 'admin@example.com', // The email address you want to receive messages at
        subject: `New Contact Message from ${input.name}`,
        html: `
          <p>You have received a new message from your website's contact form.</p>
          <p><strong>Name:</strong> ${input.name}</p>
          <p><strong>Email:</strong> ${input.email}</p>
          <p><strong>Message:</strong></p>
          <p>${input.message}</p>
        `,
      });

      console.log("Email sent successfully via Resend.");

      return {
        success: true,
        message: 'Message sent successfully!',
      };
    } catch (error: any) {
      console.error('Error in contact flow:', error);
      // Don't expose internal errors to the client.
      if (error instanceof Error && error.message.includes('Resend')) {
          return {
              success: false,
              message: 'There was an issue sending the email. Please check server configuration.'
          }
      }
      return {
        success: false,
        message: 'An unexpected error occurred while processing your message.',
      };
    }
  }
);
