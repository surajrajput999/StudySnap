import nodemailer from 'nodemailer';
import { env } from '../config/env';

let transporter: nodemailer.Transporter | null = null;

if (env.BREVO_API_KEY) {
  transporter = nodemailer.createTransport({
    host: 'smtp-relay.brevo.com',
    port: 587,
    secure: false,
    auth: {
      user: env.BREVO_SENDER_EMAIL,
      pass: env.BREVO_API_KEY,
    },
  });
}

export function getMailer() {
  return transporter;
}

export async function sendEmail(options: {
  to: string;
  subject: string;
  html: string;
}) {
  if (!transporter) {
    console.log(`[Mock Email] To: ${options.to}, Subject: ${options.subject}`);
    return { success: true, mock: true };
  }
  try {
    const info = await transporter.sendMail({
      from: `"StudySnap" <${env.BREVO_SENDER_EMAIL}>`,
      to: options.to,
      subject: options.subject,
      html: options.html,
    });
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Email send failed:', error);
    return { success: false, error };
  }
}

export async function sendRevisionReminder(email: string, name: string, pendingCount: number) {
  return sendEmail({
    to: email,
    subject: `📚 Study Reminder: ${pendingCount} notes due for revision`,
    html: `
      <div style="font-family: 'Inter', sans-serif;">
        <h2 style="color: #0061A4;">Hi ${name}!</h2>
        <p>You have <strong>${pendingCount}</strong> study note(s) due for revision today.</p>
        <p>Consistent revision is the key to long-term memory retention.</p>
        <a href="${env.FRONTEND_URL}/calendar" 
           style="display: inline-block; padding: 12px 24px; background: #0061A4; color: white; text-decoration: none; border-radius: 100px;">
          Open Revision Calendar
        </a>
        <p style="margin-top: 20px; color: #74777f; font-size: 12px;">StudySnap - Your Smart Study Companion</p>
      </div>
    `,
  });
}

export async function sendStudyStreakAlert(email: string, name: string, streak: number) {
  return sendEmail({
    to: email,
    subject: `🔥 ${streak}-Day Study Streak! Keep going ${name}!`,
    html: `
      <div style="font-family: 'Inter', sans-serif;">
        <h2 style="color: #0061A4;">Amazing Streak, ${name}! 🔥</h2>
        <p>You've studied for <strong>${streak} consecutive days</strong>!</p>
        <p>Consistency is what transforms average into excellence.</p>
        <a href="${env.FRONTEND_URL}" 
           style="display: inline-block; padding: 12px 24px; background: #0061A4; color: white; text-decoration: none; border-radius: 100px;">
          Continue Learning
        </a>
      </div>
    `,
  });
}
