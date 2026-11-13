import "dotenv/config";
import { createApp } from "./app.js";
import { createResendMailer } from "./mailer.js";

const atelierEmail = process.env.ATELIER_EMAIL ?? "secretariat.henaultescalier@gmail.com";
const allowedOrigins = (process.env.FRONTEND_ORIGIN ?? "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

const mailer = createResendMailer({
  apiKey: process.env.RESEND_API_KEY,
  from: process.env.RESEND_FROM ?? "Hénault Escalier <onboarding@resend.dev>",
  to: atelierEmail,
});

const app = createApp({ mailer, allowedOrigins });

const port = Number(process.env.PORT ?? 3001);
app.listen(port, () => {
  console.log(`Backend en écoute sur http://localhost:${port}`);
});
