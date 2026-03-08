import { getVideos } from "@/lib/data";
import { ProfileClient } from "./ProfileClient";

export default function ProfilePage() {
  const videos = getVideos(true);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
        <ProfileClient videos={videos} />
      </div>
  );
}

