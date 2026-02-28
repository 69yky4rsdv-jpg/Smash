"use client";

const LONG_TITLE_LENGTH = 45;

type Props = {
  title: string;
  /** When true, animation is paused until parent with .group is hovered (for cards). */
  animateOnHover?: boolean;
  className?: string;
};

export function ScrollingTitle({
  title,
  animateOnHover = false,
  className = ""
}: Props) {
  const isLong = title.length > LONG_TITLE_LENGTH;

  if (!isLong) {
    const staticClasses =
      animateOnHover
        ? "inline-block group-hover:animate-title-bounce"
        : "animate-title-fade-in";
    return <span className={`${staticClasses} ${className}`.trim()}>{title}</span>;
  }

  return (
    <span className={`block overflow-hidden max-w-full ${className}`}>
      <span
        className={
          "inline-flex whitespace-nowrap animate-title-scroll " +
          (animateOnHover
            ? "[animation-play-state:paused] group-hover:[animation-play-state:running]"
            : "")
        }
      >
        <span>{title}</span>
        <span className="ml-4">{title}</span>
      </span>
    </span>
  );
}
