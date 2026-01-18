import nodemailer from 'nodemailer';
import { messages } from './message';

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

// Create reusable transporter
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT || '587'),
  secure: process.env.EMAIL_PORT === '465', // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

export const sendEmail = async (options: EmailOptions): Promise<void> => {
  // Validate email configuration
  if (!process.env.EMAIL_HOST || !process.env.EMAIL_USER || !process.env.EMAIL_PASS || !process.env.EMAIL_FROM) {
    const error = new Error('Email configuration is incomplete. Please set EMAIL_HOST, EMAIL_USER, EMAIL_PASS, and EMAIL_FROM environment variables.');
    console.error(messages.emailSendingFailed(), error.message);
    throw error;
  }

  if (!options.to) {
    const error = new Error('Recipient email address is required.');
    console.error(messages.emailSendingFailed(), error.message);
    throw error;
  }

  try {
    const mailOptions = {
      from: `"Portfolio Contact" <${process.env.EMAIL_FROM}>`,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text || options.html.replace(/<[^>]*>/g, '')
    };

    await transporter.sendMail(mailOptions);
    console.log(messages.emailSentSuccessfully(), `Email sent to: ${options.to}`);
  } catch (error: any) {
    const errorMessage = error.response || error.message || 'Unknown error';
    console.error(messages.emailSendingFailed(), errorMessage);
    console.error('Email configuration:', {
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      user: process.env.EMAIL_USER,
      from: process.env.EMAIL_FROM,
      to: options.to
    });
    throw error;
  }
};

// Verify email configuration
export const verifyEmailConfig = async (): Promise<boolean> => {
  try {
    await transporter.verify();
    console.log('✅ Email server is ready');
    return true;
  } catch (error) {
    console.error('❌ Email server configuration error:', error);
    return false;
  }
};

