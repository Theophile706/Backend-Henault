import { Resend } from "resend";

export type OutgoingEmail = {
  subject: string;
  text: string;
  replyTo: string;
};

export type Mailer = (email: OutgoingEmail) => Promise<void>;

type ResendMailerOptions = {
  apiKey: string | undefined;
  from: string;
  to: string;
};

export function createResendMailer({ apiKey, from, to }: ResendMailerOptions): Mailer {
  if (!apiKey) {
    return async () => {
      throw new Error("RESEND_API_KEY manquante");
    };
  }

  const resend = new Resend(apiKey);

  return async ({ subject, text, replyTo }) => {
    const { error } = await resend.emails.send({ from, to, subject, text, replyTo });
    if (error) {
      throw new Error(`Resend: ${error.message}`);
    }
  };
}
