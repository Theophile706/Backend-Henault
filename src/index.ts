
import "dotenv/config";
import { createApp } from "./app.js";
import { createResendMailer } from "./mailer.js";

// Email destinataire : atelier Hénault
const atelierEmail =
  process.env.MAIL_TO ?? "d.grenier@henault-cie.com";

// Origines autorisées pour le frontend
const allowedOrigins = (process.env.FRONTEND_ORIGIN ?? "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

// Configuration Resend
const mailer = createResendMailer({
  apiKey: process.env.RESEND_API_KEY,
  from:
    process.env.RESEND_FROM ??
    "Hénault Escalier <onboarding@resend.dev>",
  to: atelierEmail,
});

// Création de l'application
const app = createApp({
  mailer,
  allowedOrigins,
});

// Port fourni automatiquement par Render
const port = Number(process.env.PORT ?? 3001);

// Démarrage du serveur
app.listen(port, "0.0.0.0", () => {
  console.log(`Backend démarré sur le port ${port}`);
  console.log(`Email atelier configuré : ${atelierEmail}`);
});
