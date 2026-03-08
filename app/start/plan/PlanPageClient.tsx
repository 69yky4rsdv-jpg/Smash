"use client";

import { useEffect, useState } from "react";

const COUNTDOWN_KEY = "vs_plan_countdown_end";
const HOURS = 24;

function getEndTime(): number {
  if (typeof window === "undefined") return Date.now() + HOURS * 60 * 60 * 1000;
  const stored = sessionStorage.getItem(COUNTDOWN_KEY);
  if (stored) return parseInt(stored, 10);
  const end = Date.now() + HOURS * 60 * 60 * 1000;
  sessionStorage.setItem(COUNTDOWN_KEY, String(end));
  return end;
}

function formatTimeLeft(ms: number): { hours: string; minutes: string; seconds: string } {
  if (ms <= 0) return { hours: "00", minutes: "00", seconds: "00" };
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return {
    hours: hours.toString().padStart(2, "0"),
    minutes: minutes.toString().padStart(2, "0"),
    seconds: seconds.toString().padStart(2, "0")
  };
}

type Props = {
  pendingEmail: string;
};

export function PlanPageClient({ pendingEmail }: Props) {
  const [timeLeft, setTimeLeft] = useState<number | null>(null);

  useEffect(() => {
    const end = getEndTime();
    const tick = () => {
      const remaining = end - Date.now();
      setTimeLeft(remaining > 0 ? remaining : 0);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  const display = timeLeft !== null ? formatTimeLeft(timeLeft) : null;

  return (
    <div className="mt-8 space-y-4">
      {display && (
        <div className="flex flex-col items-center gap-1">
          <p className="text-xs font-medium uppercase tracking-wider text-neutral-500">
            Offer expires in
          </p>
          <div className="countdown-timer-box inline-flex items-center gap-1 rounded-lg border-2 border-pink-500/50 bg-pink-500/10 px-4 py-2 font-mono text-xl tabular-nums">
            <span className="countdown-digit inline-block min-w-[1.5rem] text-center">
              {display.hours}
            </span>
            <span className="text-pink-400">:</span>
            <span className="countdown-digit inline-block min-w-[1.5rem] text-center">
              {display.minutes}
            </span>
            <span className="text-pink-400">:</span>
            <span className="countdown-digit inline-block min-w-[1.5rem] text-center">
              {display.seconds}
            </span>
          </div>
        </div>
      )}
      <div
        className="limited-time-btn flex w-full min-h-[48px] cursor-default items-center justify-center rounded-full bg-pink-500 px-6 py-4 text-base font-bold uppercase tracking-wider text-white shadow-lg shadow-pink-500/25"
        aria-hidden
      >
        Limited time
      </div>
    </div>
  );
}
