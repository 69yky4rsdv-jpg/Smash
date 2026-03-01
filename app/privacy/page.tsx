import { AgeGate } from "../(site)/AgeGate";

export default function PrivacyPage() {
  return (
    <AgeGate>
      <div className="mx-auto max-w-3xl px-4 py-10 space-y-8">
          <header className="space-y-2">
            <h1 className="text-3xl font-semibold tracking-tight">Privacy Policy</h1>
            <p className="text-sm text-neutral-400">Last updated: {new Date().toLocaleDateString()}</p>
          </header>
          <div className="prose prose-invert prose-sm max-w-none space-y-4 text-neutral-300">
            <p>
              This privacy policy describes how we collect, use, and protect your information when
              you use our service. By using this site, you agree to this policy.
            </p>
            <h2 className="text-lg font-semibold text-neutral-100 mt-6">Information we collect</h2>
            <p>
              We collect information you provide when you create an account, subscribe, or contact
              us, including email address, payment information (processed by our payment
              providers), and usage data such as pages viewed and preferences.
            </p>
            <h2 className="text-lg font-semibold text-neutral-100 mt-6">How we use it</h2>
            <p>
              We use your information to provide and improve our service, process payments,
              communicate with you, and comply with legal obligations. We do not sell your personal
              information to third parties.
            </p>
            <h2 className="text-lg font-semibold text-neutral-100 mt-6">Cookies and tracking</h2>
            <p>
              We use cookies and similar technologies for session management, preferences, and
              analytics. You can adjust your browser settings to limit cookies.
            </p>
            <h2 className="text-lg font-semibold text-neutral-100 mt-6">Contact</h2>
            <p>
              For privacy-related questions or requests, please contact us through the Support
              page.
            </p>
          </div>
        </div>
    </AgeGate>
  );
}
