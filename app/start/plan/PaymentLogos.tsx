export function PaymentLogos() {
  return (
    <div className="mt-6 flex flex-wrap justify-center gap-8">
      {/* Credit cards */}
      <div className="flex flex-col items-center gap-1.5" aria-hidden>
        <div className="flex h-16 w-16 items-center justify-center rounded-xl border-2 border-pink-500/50 bg-white/5 p-2.5 transition hover:scale-105 hover:border-pink-400 hover:bg-white/10 hover:shadow-md hover:shadow-pink-500/20">
          <svg viewBox="0 0 36 24" className="h-9 w-full max-w-[36px]" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <rect x="0.5" y="2" width="35" height="20" rx="2.5" />
            <path d="M0.5 9h35" />
            <path d="M6 17h6" />
          </svg>
        </div>
        <span className="text-[10px] font-medium uppercase tracking-wider text-neutral-400">Cards</span>
      </div>

      {/* PayPal */}
      <div className="flex flex-col items-center gap-1.5" aria-hidden>
        <div className="flex h-16 w-16 items-center justify-center rounded-xl border-2 border-pink-500/50 bg-[#003087]/40 p-2.5 transition hover:scale-105 hover:border-pink-400 hover:bg-[#003087]/60 hover:shadow-md hover:shadow-pink-500/20">
          <span className="text-2xl font-bold italic text-[#009cde]">P</span>
        </div>
        <span className="text-[10px] font-medium uppercase tracking-wider text-neutral-400">PayPal</span>
      </div>

      {/* Crypto */}
      <div className="flex flex-col items-center gap-1.5" aria-hidden>
        <div className="flex h-16 w-16 items-center justify-center rounded-xl border-2 border-pink-500/50 bg-amber-500/20 p-2.5 transition hover:scale-105 hover:border-pink-400 hover:bg-amber-500/30 hover:shadow-md hover:shadow-pink-500/20">
          <svg viewBox="0 0 24 24" className="h-9 w-9 text-amber-400" fill="currentColor" aria-hidden>
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.31-8.86c-1.77-.45-2.34-.94-2.34-1.67 0-.84.79-1.43 2.1-1.43 1.38 0 1.9.66 1.94 1.64h1.71c-.05-1.34-.87-2.57-2.66-2.97V5.1H10.9v1.69c-1.58.32-2.72 1.3-2.72 2.81 0 1.79 1.49 2.69 3.66 3.21 1.95.46 2.34 1.15 2.34 1.87 0 .53-.4 1.39-2.1 1.39-1.6 0-2.23-.72-2.32-1.64H8.04c.1 1.7 1.36 2.66 2.86 2.97v1.69h1.55v-1.68c1.52-.24 2.72-1.04 2.73-2.83-.01-1.54-1.24-2.35-3.43-2.88z" />
          </svg>
        </div>
        <span className="text-[10px] font-medium uppercase tracking-wider text-neutral-400">Crypto</span>
      </div>

      {/* Apple Pay */}
      <div className="flex flex-col items-center gap-1.5" aria-hidden>
        <div className="flex h-16 w-16 items-center justify-center rounded-xl border-2 border-pink-500/50 bg-white/5 p-2.5 transition hover:scale-105 hover:border-pink-400 hover:bg-white/10 hover:shadow-md hover:shadow-pink-500/20">
          <svg viewBox="0 0 24 24" className="h-9 w-9 text-white" fill="currentColor" aria-hidden>
            <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
          </svg>
        </div>
        <span className="text-[10px] font-medium uppercase tracking-wider text-neutral-400">Apple Pay</span>
      </div>
    </div>
  );
}
