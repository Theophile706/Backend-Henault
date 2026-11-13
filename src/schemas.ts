import { z } from "zod";

const singleLine = (max: number) =>
  z
    .string()
    .trim()
    .min(1)
    .max(max)
    .regex(/^[^\r\n]*$/, "Une seule ligne attendue");

const optionalText = (max: number) => z.string().trim().max(max).optional().default("");

const email = z.string().trim().max(200).email();
const phone = z.string().trim().min(6).max(30);

export const quoteSchema = z.object({
  stairType: singleLine(200),
  material: singleLine(200),
  projectNature: optionalText(200),
  delay: optionalText(200),
  dimensions: optionalText(2000),
  fullName: singleLine(120),
  phone,
  email,
  city: singleLine(120),
  financing: z.boolean().optional().default(false),
});

export const appointmentSchema = z.object({
  sector: singleLine(120),
  slot: singleLine(120),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  fullName: singleLine(120),
  phone,
  email,
  address: singleLine(300),
  notes: optionalText(2000),
});

export const contactSchema = z.object({
  firstName: singleLine(100),
  lastName: singleLine(100),
  email,
  phone: optionalText(30),
  subject: singleLine(200),
  message: z.string().trim().min(1).max(5000),
});

export type QuoteInput = z.infer<typeof quoteSchema>;
export type AppointmentInput = z.infer<typeof appointmentSchema>;
export type ContactInput = z.infer<typeof contactSchema>;
