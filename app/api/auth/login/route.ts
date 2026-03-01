import { NextResponse } from "next/server";
import { authenticate } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const formData = await request.formData();
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  const user = authenticate(email, password);

  if (!user) {
    return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true }, {
    headers: { "Cache-Control": "private, no-store" }
  });
  const isProduction = process.env.NODE_ENV === "production";
  res.cookies.set("vs_userId", user.id, {
    httpOnly: false,
    path: "/",
    sameSite: "lax",
    secure: isProduction,
    maxAge: 60 * 60 * 24 * 365
  });

  return res;
}

