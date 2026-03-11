import { Resend } from "resend";
import { getSiteSettings } from "./site-settings";

const resendApiKey = process.env.RESEND_API_KEY?.trim();
const fromAddress = process.env.RESEND_FROM?.trim() || "onboarding@resend.dev";

/**
 * Sends a signup confirmation email to the user after they enter their email on /start.
 * No-op if RESEND_API_KEY is not set. Uses RESEND_FROM for sender (default: onboarding@resend.dev for testing).
 */
export async function sendSignupConfirmationEmail(to: string): Promise<{ ok: boolean; error?: string }> {
  if (!resendApiKey) {
    return { ok: false, error: "RESEND_API_KEY not configured" };
  }

  const site = getSiteSettings();
  const siteName = site.siteName || "SmashPov";
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim() || "https://smashpov.com";
  const planUrl = `${baseUrl.replace(/\/$/, "")}/start/plan`;

  const resend = new Resend(resendApiKey);
  const { data, error } = await resend.emails.send({
    from: `No Reply <${fromAddress}>`,
    to: [to],
    subject: `Confirm your email — ${siteName}`,
    html: `
      <p>Thanks for signing up!</p>
      <p>Click the link below to choose your plan and continue:</p>
      <p><a href="${planUrl}" style="color:#ec4899;">${planUrl}</a></p>
      <p>If you didn't request this, you can ignore this email.</p>
      <p>— ${siteName}</p>
    `,
    idempotencyKey: `signup-${to.toLowerCase().replace(/[^a-z0-9]/g, "-")}-${Date.now()}`,
  });

  if (error) {
    console.error("[send-email] Resend error:", error);
    return { ok: false, error: error.message };
  }
  return { ok: true };
}
