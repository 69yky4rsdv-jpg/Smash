import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import {
  getStorePreviewStats,
  recordStorePreviewEvent,
  type StorePreviewEventType,
} from "@/lib/store-preview-analytics";

const ALLOWED_EVENTS: StorePreviewEventType[] = [
  "human_confirm",
  "preview_play",
  "buy_click",
];

export async function GET(request: NextRequest) {
  const { isAdmin } = await getSession();
  if (!isAdmin) {
    return NextResponse.json({ ok: false, error: "forbidden" }, { status: 403 });
  }

  const videoId = request.nextUrl.searchParams.get("videoId")?.trim();
  if (!videoId) {
    return NextResponse.json({ ok: false, error: "missing_video_id" }, { status: 400 });
  }

  return NextResponse.json({ ok: true, stats: getStorePreviewStats(videoId) });
}

export async function POST(request: NextRequest) {
  let body: { videoId?: string; event?: string; visitId?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  const videoId = body.videoId?.trim();
  const event = body.event as StorePreviewEventType | undefined;
  if (!videoId || !event || !ALLOWED_EVENTS.includes(event)) {
    return NextResponse.json({ ok: false, error: "invalid_payload" }, { status: 400 });
  }

  const { isAdmin, user } = await getSession();
  const userAgent = request.headers.get("user-agent");
  const referer = request.headers.get("referer");
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    undefined;

  recordStorePreviewEvent({
    videoId,
    event,
    visitId: body.visitId?.trim() || undefined,
    userAgent,
    referer,
    ip,
    isAdmin,
    isLoggedIn: Boolean(user),
  });

  return NextResponse.json({ ok: true });
}
