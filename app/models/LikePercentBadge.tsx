import type { VideoEngagement } from "@/lib/video-engagement";

type Props = {
  engagement: VideoEngagement;
  className?: string;
};

export function LikePercentBadge({ engagement, className = "" }: Props) {
  const label = engagement.views > 0 ? `${engagement.likePercent}%` : "New";

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full bg-black/70 px-2 py-0.5 text-[10px] font-semibold text-pink-200 backdrop-blur-sm ${className}`}
    >
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-3 w-3" aria-hidden>
        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
      </svg>
      {label}
    </span>
  );
}
