export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 space-y-8">
          <header className="space-y-2">
            <h1 className="text-3xl font-semibold tracking-tight">Terms of Service</h1>
            <p className="text-sm text-neutral-400">Last updated: {new Date().toLocaleDateString()}</p>
          </header>
          <div className="prose prose-invert prose-sm max-w-none space-y-4 text-neutral-300">
            <p>
              By accessing or using this service, you agree to be bound by these Terms of
              Service. If you do not agree, do not use the service.
            </p>
            <h2 className="text-lg font-semibold text-neutral-100 mt-6">Eligibility</h2>
            <p>
              You must be at least 18 years of age (or the age of majority in your jurisdiction)
              to use this service. By using the service, you represent that you meet this
              requirement.
            </p>
            <h2 className="text-lg font-semibold text-neutral-100 mt-6">Account and subscription</h2>
            <p>
              You are responsible for maintaining the confidentiality of your account and
              password. Subscriptions are billed according to the plan you select. You may cancel
              in accordance with the billing terms presented at signup.
            </p>
            <h2 className="text-lg font-semibold text-neutral-100 mt-6">Acceptable use</h2>
            <p>
              You may not redistribute, download, or otherwise exploit content outside the
              permitted use of the service. You may not use the service for any illegal purpose
              or in violation of these terms.
            </p>
            <h2 className="text-lg font-semibold text-neutral-100 mt-6">Changes</h2>
            <p>
              We may update these terms from time to time. Continued use of the service after
              changes constitutes acceptance. Material changes may be communicated via email or
              notice on the site.
            </p>
            <h2 className="text-lg font-semibold text-neutral-100 mt-6">Contact</h2>
            <p>
              For questions about these terms, please use the Support page.
            </p>
          </div>
        </div>
  );
}
