import { NextRequest, NextResponse } from "next/server";
import { getVideoPhotoUrls, getVideos } from "@/lib/data";

/** GET /api/admin/video-photos?videoId=xxx – returns gallery URLs for the thumbnail selector. */
export async function GET(request: NextRequest) {
  const videoId = request.nextUrl.searchParams.get("videoId");
  if (!videoId) {
    return NextResponse.json({ urls: [] }, { status: 200 });
  }
  const videos = getVideos(true);
  if (!videos.some((v) => v.id === videoId)) {
    return NextResponse.json({ urls: [] }, { status: 200 });
  }
  const urls = getVideoPhotoUrls(videoId);
  return NextResponse.json({ urls });
}
