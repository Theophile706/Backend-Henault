import cors from "cors";
import express, { type NextFunction, type Request, type Response } from "express";
import type { Mailer } from "./mailer.js";
import {
  appointmentSchema,
  contactSchema,
  quoteSchema,
  type AppointmentInput,
  type ContactInput,
  type QuoteInput,
} from "./schemas.js";

type AppOptions = {
  mailer: Mailer;
  allowedOrigins: string[];
};

export function createApp({ mailer, allowedOrigins }: AppOptions) {
  const app = express();

  app.use(cors({ origin: allowedOrigins, methods: ["GET", "POST"] }));
  app.use(express.json({ limit: "100kb" }));

  app.get("/api/health", (_req, res) => {
    res.json({ ok: true });
  });

  app.post("/api/quotes", async (req, res) => {
    const parsed = quoteSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Données invalides", issues: parsed.error.flatten().fieldErrors });
      return;
    }
    const data = parsed.data;
    await mailer({
      replyTo: data.email,
      subject: `Demande de devis escalier sur mesure - ${data.fullName} (${data.city})`,
      text: formatQuote(data),
    });
    res.status(201).json({ ok: true });
  });

  app.post("/api/appointments", async (req, res) => {
    const parsed = appointmentSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Données invalides", issues: parsed.error.flatten().fieldErrors });
      return;
    }
    const data = parsed.data;
    await mailer({
      replyTo: data.email,
      subject: `Demande de rendez-vous conseil - ${data.fullName} (${data.sector})`,
      text: formatAppointment(data),
    });
    res.status(201).json({ ok: true });
  });

  app.post("/api/contact", async (req, res) => {
    const parsed = contactSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Données invalides", issues: parsed.error.flatten().fieldErrors });
      return;
    }
    const data = parsed.data;
    await mailer({
      replyTo: data.email,
      subject: data.subject,
      text: formatContact(data),
    });
    res.status(201).json({ ok: true });
  });

  app.use((error: unknown, _req: Request, res: Response, _next: NextFunction) => {
    console.error(error);
    const status = (error as { status?: number }).status;
    if (typeof status === "number" && status >= 400 && status < 500) {
      res.status(status).json({ error: "Requête invalide" });
      return;
    }
    res.status(502).json({ error: "L'envoi du message a échoué. Merci de réessayer." });
  });

  return app;
}

function formatQuote(d: QuoteInput) {
  return [
    "DEMANDE DE DEVIS ESCALIER SUR MESURE",
    "",
    `Type d'escalier : ${d.stairType}`,
    `Matériau souhaité : ${d.material}`,
    `Nature du projet : ${d.projectNature}`,
    `Option Financement : ${d.financing ? "Oui (Financement avec notre partenaire ARKEA)" : "Non"}`,
    `Délai souhaité : ${d.delay}`,
    `Dimensions ou remarques : ${d.dimensions}`,
    "",
    "COORDONNÉES CLIENT :",
    `Nom et Prénom : ${d.fullName}`,
    `Téléphone : ${d.phone}`,
    `E-mail : ${d.email}`,
    `Ville ou Code Postal : ${d.city}`,
    "",
    "Fabricant : Hénault Escalier - 9 bis rue du Bout de la ville, 41200 Romorantin",
  ].join("\n");
}

function formatAppointment(d: AppointmentInput) {
  return [
    "DEMANDE DE RENDEZ-VOUS CONSEIL EN LIGNE",
    "",
    `Secteur d'intervention : ${d.sector}`,
    `Date souhaitée : ${d.date}`,
    `Créneau horaire : ${d.slot}`,
    `Adresse complète : ${d.address}`,
    `Remarques / Accès : ${d.notes}`,
    "",
    "COORDONNÉES CLIENT :",
    `Nom et Prénom : ${d.fullName}`,
    `Téléphone : ${d.phone}`,
    `E-mail : ${d.email}`,
    "",
    "Horaires atelier : Lundi au vendredi, 9h00-12h30 et 13h30-18h00",
    "Hénault Escalier - 9 bis rue du Bout de la ville, 41200 Romorantin",
  ].join("\n");
}

function formatContact(d: ContactInput) {
  return [
    `Prénom : ${d.firstName}`,
    `Nom : ${d.lastName}`,
    `E-mail : ${d.email}`,
    `Téléphone : ${d.phone}`,
    "",
    d.message,
  ].join("\n");
}
