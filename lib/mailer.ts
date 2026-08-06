// Mailer wrapper using nodemailer
import nodemailer from "nodemailer";

const host = process.env.SMTP_HOST;
const port = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT) : undefined;
const user = process.env.SMTP_USER;
const pass = process.env.SMTP_PASS;
const from = process.env.SMTP_FROM || "no-reply@yourdomain.com";

if (!host || !port || !user || !pass) {
  console.warn("SMTP not fully configured. Emails will not be sent.");
}

const transporter = nodemailer.createTransport({
  host,
  port,
  secure: port === 465,
  auth: user && pass ? { user, pass } : undefined,
});

export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}) {
  if (!host || !port || !user || !pass) {
    console.warn("Skipping email send; SMTP not configured.");
    return;
  }

  await transporter.sendMail({
    from,
    to,
    subject,
    html,
  });
}
