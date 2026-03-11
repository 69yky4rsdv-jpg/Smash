import { addPendingSignupEmail, isEmailAlreadyUsed } from "@/lib/data";
import { sendSignupConfirmationEmail } from "@/lib/send-email";
import { getSiteSettings } from "@/lib/site-settings";
import { cookies } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { StartPageClient } from "./StartPageClient";

/** Basic email format check: local@domain.tld, reasonable length. */
function isValidEmail(value: string): boolean {
  const trimmed = value.trim().toLowerCase();
  if (trimmed.length > 254) return false;
  const parts = trimmed.split("@");
  if (parts.length !== 2) return false;
  const [local, domain] = parts;
  if (!local?.length || local.length > 64) return false;
  if (!domain?.length || !domain.includes(".")) return false;
  const domainParts = domain.split(".");
  const tld = domainParts[domainParts.length - 1];
  if (!tld || tld.length < 2) return false;
  return /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?)*$/.test(trimmed);
}

async function saveStartEmailAction(formData: FormData): Promise<{ error?: string } | void> {
  "use server";
  const email = String(formData.get("email") ?? "").trim();
  if (!email) return { error: "Email is required." };
  if (!isValidEmail(email)) return { error: "Please enter a valid email address." };
  if (isEmailAlreadyUsed(email)) return { error: "This email is already registered or has already signed up." };
  addPendingSignupEmail(email);
  revalidatePath("/admin");
  // Send confirmation email if Resend is configured (does not block redirect on failure)
  const emailResult = await sendSignupConfirmationEmail(email);
  if (!emailResult.ok && emailResult.error && emailResult.error !== "RESEND_API_KEY not configured") {
    console.error("[start] Signup email failed:", emailResult.error);
  }
  const cookieStore = await cookies();
  cookieStore.set("vs_pending_email", email, { path: "/", maxAge: 60 * 60 * 24 });
  redirect("/start/plan");
}

const BOTTOM_ITEMS = [
  {
    title: "New updates daily",
    subtitle: "Enjoy new scenes every day",
    imageUrl: null,
  },
  {
    title: "Top names & exclusive talent",
    subtitle: "Watch the biggest names & contracted stars",
    imageUrl: null,
  },
  {
    title: "A scene for every taste",
    subtitle: "The most diverse array of performers & original content anywhere",
    imageUrl: null,
  },
  {
    title: "Original series & live shows",
    subtitle: "Pushing the boundaries of what an adult site can be",
    imageUrl: null,
  },
];

// Always read fresh site settings so admin image changes show up (no static cache)
export const dynamic = "force-dynamic";

export default async function StartPage() {
  const site = getSiteSettings();
  const leftHeroUrl = site.startPageLeftHeroUrl ?? site.heroBannerImageUrl ?? null;
  const rightHeroUrl = site.startPageRightHeroUrl ?? site.heroBannerImageUrl ?? null;
  // Explicit 4 slots so each card gets the correct image (avoids "stuck on first" when array is sparse)
  const raw = site.startPageBottomImageUrls ?? [];
  const bottomUrls: (string | undefined)[] = [raw[0], raw[1], raw[2], raw[3]];

  return (
    <div className="min-h-screen w-full bg-black text-white">
      {/* Top header block */}
      <header className="relative z-10 px-4 pt-6 pb-4 text-center pl-[max(1rem,env(safe-area-inset-left))] pr-[max(1rem,env(safe-area-inset-right))] sm:pt-8 sm:pb-6">
        <Link
          href="/start"
          className="inline-block focus:outline-none focus:ring-2 focus:ring-pink-400/50 rounded"
        >
          <h1
            className="text-2xl font-bold uppercase tracking-[0.2em] text-pink-200 drop-shadow-lg sm:text-4xl sm:tracking-[0.25em] md:text-5xl"
            style={{ fontFamily: '"Zing Rust", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}
          >
            {site.siteName}
          </h1>
        </Link>
        <p className="mt-2 text-xs font-medium uppercase tracking-[0.2em] text-white/95 sm:mt-3 sm:text-sm">
          Discover new releases
        </p>
        <p className="mt-1 text-xs font-medium uppercase tracking-[0.2em] text-white/95 sm:text-sm">
          Sign up today!
        </p>
      </header>

      {/* Main: two vertical hero images + center form */}
      <div className="relative flex min-h-[50vh] w-full flex-col lg:min-h-[60vh] lg:flex-row">
        {/* Left vertical hero */}
        <div className="relative hidden w-full flex-shrink-0 lg:block lg:max-w-[28%]">
          <div className="sticky top-0 h-[70vh] w-full">
            {leftHeroUrl ? (
              <img
                src={leftHeroUrl}
                alt=""
                className="h-full w-full object-cover object-top"
              />
            ) : (
              <div className="h-full w-full bg-gradient-to-b from-pink-900/40 via-neutral-900 to-black" />
            )}
          </div>
        </div>

        {/* Center: email signup form */}
        <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-4 py-6 sm:py-10 lg:py-16">
          <div className="w-full max-w-md rounded-xl border border-white/10 bg-black/60 px-4 py-6 shadow-2xl backdrop-blur-sm sm:px-6 sm:py-8">
            <p className="text-sm font-semibold uppercase tracking-wider text-pink-400">
              Step 1 — Enter your email
            </p>
            <StartPageClient saveEmailAction={saveStartEmailAction} />
          </div>
        </div>

        {/* Right vertical hero */}
        <div className="relative hidden w-full flex-shrink-0 lg:block lg:max-w-[28%]">
          <div className="sticky top-0 h-[70vh] w-full">
            {rightHeroUrl ? (
              <img
                src={rightHeroUrl}
                alt=""
                className="h-full w-full object-cover object-top"
              />
            ) : (
              <div className="h-full w-full bg-gradient-to-b from-pink-900/40 via-neutral-900 to-black" />
            )}
          </div>
        </div>
      </div>

      {/* Bottom content grid */}
      <section className="border-t border-white/10 bg-black/80 px-4 py-8 pl-[max(1rem,env(safe-area-inset-left))] pr-[max(1rem,env(safe-area-inset-right))] pb-[max(2rem,env(safe-area-inset-bottom))] sm:py-10">
        <div className="mx-auto grid max-w-6xl gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {BOTTOM_ITEMS.map((item, i) => {
            const imageUrl = (bottomUrls[i]?.trim()) || item.imageUrl || null;
            return (
            <Link
              key={`start-bottom-${i}-${imageUrl ?? "placeholder"}`}
              href="/start"
              className="group flex flex-col rounded-lg border border-white/10 bg-white/5 p-4 transition hover:border-pink-500/30 hover:bg-white/10"
            >
              <div className="mb-3 aspect-video w-full overflow-hidden rounded-lg bg-neutral-800">
                {imageUrl ? (
                  <img
                    key={imageUrl}
                    src={imageUrl}
                    alt=""
                    className="h-full w-full object-cover transition group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-neutral-500 text-xs">
                    Preview
                  </div>
                )}
              </div>
              <h3 className="text-sm font-semibold uppercase tracking-wide text-pink-400">
                {item.title}
              </h3>
              <p className="mt-1 text-xs text-neutral-400 line-clamp-2">
                {item.subtitle}
              </p>
            </Link>
          );
          })}
        </div>
      </section>
    </div>
  );
}
