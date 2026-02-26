import Link from "next/link";
import { redirect } from "next/navigation";
import SiteShell from "../../(site)/Shell";
import { AgeGate } from "../../(site)/AgeGate";
import { categories, getVideos, models } from "@/lib/data";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function VideoDetailPage({ params }: Props) {
  const { id } = await params;
  const videos = getVideos();
  const video = videos.find((v) => v.id === id);

  if (!video) {
    redirect("/videos");
  }

  const videoModels = models.filter((m) => video.models.includes(m.id));
  const videoCategories = categories.filter((c) => video.categories.includes(c.id));

  return (
    <AgeGate>
      <SiteShell>
        <div className="mx-auto max-w-5xl px-4 py-10 space-y-8">
          <header className="space-y-2">
            <Link
              href="/videos"
              className="text-xs text-accent-pinkSoft hover:text-accent-pink"
            >
              ← Back to all videos
            </Link>
            <p className="text-xs text-accent-pinkSoft">Scene</p>
            <h1 className="text-3xl font-semibold tracking-tight">{video.title}</h1>
            <p className="text-xs text-neutral-400">
              {new Date(video.publishedAt).toLocaleDateString()} ·{" "}
              {videoModels.map((m) => m.stageName).join(", ")}
            </p>
          </header>

          <section className="grid gap-6 md:grid-cols-[3fr,2fr]">
            <div className="space-y-3">
              <div className="aspect-video w-full overflow-hidden rounded-2xl bg-gradient-to-tr from-pink-500/30 via-black to-pink-700/40 shadow-[0_18px_45px_rgba(0,0,0,0.85)]">
                {video.thumbnailUrl ? (
                  <img
                    src={video.thumbnailUrl}
                    alt={video.title}
                    className="h-full w-full object-cover"
                  />
                ) : null}
              </div>
              <p className="text-[13px] text-neutral-200">{video.description}</p>
            </div>
            <aside className="space-y-4 text-sm">
              <div className="card-surface p-4 space-y-2">
                <p className="text-xs font-semibold text-neutral-300">Categories</p>
                <div className="flex flex-wrap gap-2 text-[11px]">
                  {videoCategories.map((cat) => (
                    <span
                      key={cat.id}
                      className="rounded-full bg-white/5 px-3 py-1 text-xs text-neutral-100"
                    >
                      {cat.name}
                    </span>
                  ))}
                </div>
              </div>
              <div className="card-surface p-4 space-y-2">
                <p className="text-xs font-semibold text-neutral-300">Models</p>
                <div className="flex flex-wrap gap-2 text-[13px]">
                  {videoModels.map((model) => (
                    <Link
                      key={model.id}
                      href={`/models/${model.id}`}
                      className="text-neutral-100 hover:text-accent-pinkSoft underline-offset-2 hover:underline"
                    >
                      {model.stageName}
                    </Link>
                  ))}
                </div>
              </div>
            </aside>
          </section>
        </div>
      </SiteShell>
    </AgeGate>
  );
}

