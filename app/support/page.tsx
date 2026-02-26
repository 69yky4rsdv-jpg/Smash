import SiteShell from "../(site)/Shell";
import { AgeGate } from "../(site)/AgeGate";

export default function SupportPage() {
  return (
    <AgeGate>
      <SiteShell>
        <div className="mx-auto max-w-3xl px-4 py-10 space-y-8">
          <header className="space-y-2">
            <h1 className="text-3xl font-semibold tracking-tight">Support</h1>
            <p className="text-sm text-neutral-300">
              Get help with your account, billing, or technical issues.
            </p>
          </header>
          <div className="space-y-6">
            <section className="rounded-xl border border-white/10 bg-white/5 p-5">
              <h2 className="text-lg font-semibold text-neutral-100">FAQ</h2>
              <ul className="mt-3 space-y-3 text-sm text-neutral-300">
                <li>
                  <strong className="text-neutral-200">How do I cancel my subscription?</strong>
                  <br />
                  You can manage or cancel your subscription from your account settings or by
                  contacting support.
                </li>
                <li>
                  <strong className="text-neutral-200">I forgot my password.</strong>
                  <br />
                  Use the “Forgot password” link on the login page to reset it via email.
                </li>
                <li>
                  <strong className="text-neutral-200">Video won’t play.</strong>
                  <br />
                  Try another browser or device, clear cache, and ensure you have a stable
                  connection. If it continues, contact support with your plan and device details.
                </li>
              </ul>
            </section>
            <section className="rounded-xl border border-white/10 bg-white/5 p-5">
              <h2 className="text-lg font-semibold text-neutral-100">Contact support</h2>
              <p className="mt-2 text-sm text-neutral-400">
                For billing, account, or technical support, email us at{" "}
                <a href="mailto:support@example.com" className="text-accent-pinkSoft hover:text-accent-pink">
                  support@example.com
                </a>
                . We aim to respond within 24–48 hours.
              </p>
            </section>
          </div>
        </div>
      </SiteShell>
    </AgeGate>
  );
}
