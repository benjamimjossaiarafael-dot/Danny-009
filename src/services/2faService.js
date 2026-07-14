import speakeasy from 'speakeasy';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

export function generateSecret() {
  return speakeasy.generateSecret({ length: 20 });
}

export function verifyToken(secret, token) {
  return speakeasy.totp.verify({ secret: secret.base32 || secret, encoding: 'base32', token, window: 1 });
}

export async function sendEmailCode(to, subject, text) {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
  const info = await transporter.sendMail({ from: process.env.SMTP_USER, to, subject, text });
  return info;
}
