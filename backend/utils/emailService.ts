import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import { render } from '@react-email/render';

dotenv.config();

// Create nodemailer transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.SMTP_EMAIL,
    pass: process.env.SMTP_APP_PASS,
  },
});

/**
 * Generic email sending service.
 * @param to recipient email address
 * @param subject Email subject
 * @param reactComponent The React Email component to render and send
 */
export const sendEmail = async (to: string, subject: string, reactComponent: any) => {
  try {
    const html = await render(reactComponent as React.ReactElement);

    if (process.env.SMTP_EMAIL && process.env.SMTP_APP_PASS) {
      await transporter.sendMail({
        from: `"Library Management System" <${process.env.SMTP_EMAIL}>`,
        to,
        subject,
        html,
      });
      console.log(`[EmailService] Successfully sent email to ${to}`);
    } else {
      // Development fallback if no SMTP credentials are provided
      console.warn(`[EmailService] SMTP_EMAIL or SMTP_APP_PASS not set. Mocking email send to ${to}`);
      console.log(`[EmailService] Subject: ${subject}`);
      console.log(`[EmailService] HTML Output: \n`, html);
    }
  } catch (error) {
    console.error(`[EmailService] Failed to send email to ${to}:`, error);
  }
};
