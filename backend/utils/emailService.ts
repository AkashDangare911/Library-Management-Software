import { Resend } from 'resend';
import dotenv from 'dotenv';
import { render } from '@react-email/render';

dotenv.config();

// Create resend client only if API key exists, otherwise we'll log out emails in dev mode
const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

/**
 * Generic email sending service.
 * @param to recipient email address
 * @param subject Email subject
 * @param reactComponent The React Email component to render and send
 */
export const sendEmail = async (to: string, subject: string, reactComponent: any) => {
  try {
    const html = await render(reactComponent as React.ReactElement);

    if (resend) {
      await resend.emails.send({
        from: 'Library Management System <onboarding@resend.dev>', // Use onboarding@resend.dev for testing without verified domain
        to,
        subject,
        html,
      });
      console.log(`[EmailService] Successfully sent email to ${to}`);
    } else {
      // Development fallback if no API key is provided
      console.warn(`[EmailService] RESEND_API_KEY not set. Mocking email send to ${to}`);
      console.log(`[EmailService] Subject: ${subject}`);
      console.log(`[EmailService] HTML Output: \n`, html);
    }
  } catch (error) {
    console.error(`[EmailService] Failed to send email to ${to}:`, error);
  }
};
