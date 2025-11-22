
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
      const resend = new Resend(process.env.RESEND_API_KEY);

      // NOTE: For testing with the 'onboarding@resend.dev' address,
      // Resend will automatically send the email to the address you signed up with,
      // regardless of what is in the 'to' field.
      // For production, you must verify a domain with Resend.
      const { data, error } = await resend.emails.send({
        from: 'Acme <onboarding@resend.dev>', // A verified domain is required for production
        to: ['delivered@resend.dev'], // This is ignored in sandbox but required by the API.
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
        console.error('Resend error:', error);
        return {
            success: false,
            message: `Error sending email: ${error.message}`
        }
      }

      console.log("Email sent successfully via Resend:", data);

      return {
        success: true,
        message: 'Message sent successfully!',
      };
    } catch (error: any) {
      console.error('Error in contact flow:', error);
      // Don't expose internal errors to the client.
      if (error instanceof Error && (error.message.includes('Resend') || error.message.includes('API key'))) {
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
