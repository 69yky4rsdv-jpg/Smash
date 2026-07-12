import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import {
  recordStorePreviewEvent,
  type StorePreviewEventType,
} from "@/lib/store-preview-analytics";

const ALLOWED_EVENTS: StorePreviewEventType[] = [
  "human_confirm",
  "preview_play",
  "buy_click",
];

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

  const { isAdmin } = await getSession();
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
  });

  return NextResponse.json({ ok: true });
}
