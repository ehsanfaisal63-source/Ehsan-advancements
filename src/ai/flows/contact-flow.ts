
'use server';
/**
 * @fileOverview A flow to handle contact form submissions.
 *
 * - handleContactMessage - Sends an email via Resend.
 * - ContactMessageInput - The input type for the flow.
 * - ContactMessageOutput - The return type for the flow.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { Resend } from 'resend';

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
      const resendApiKey = process.env.RESEND_API_KEY;
      if (!resendApiKey) {
        throw new Error("Resend API key is not configured. Please set RESEND_API_KEY in your environment variables.");
      }
      const resend = new Resend(resendApiKey);

      const { data, error } = await resend.emails.send({
        from: 'onboarding@resend.dev',
        to: ['ehsanfaisal189@gmail.com'], 
        subject: `New Contact Message from ${input.name}`,
        html: `
          <p>You have received a new message from your website's contact form.</p>
          <p><strong>Name:</strong> ${input.name}</p>
          <p><strong>Email:</strong> ${input.email}</p>
          <p><strong>Message:</strong></p>
          <p>${input.message}</p>
        `,
      });

      if (error) {
        console.error('Resend API Error:', error);
        return {
            success: false,
            message: `Failed to send email: ${error.message}`
        }
      }

      console.log("Email sent successfully via Resend:", data);
      return {
        success: true,
        message: 'Message sent successfully!',
      };
    } catch (error: any) {
      console.error('Error in contact flow:', error);
      return {
        success: false,
        message: error.message || 'An unexpected server error occurred.',
      };
    }
  }
);
