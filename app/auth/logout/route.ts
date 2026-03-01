import { NextResponse } from "next/server";

export async function GET() {
  const base = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";
  const res = NextResponse.redirect(new URL("/", base));
  const isProduction = process.env.NODE_ENV === "production";
  res.cookies.set("vs_userId", "", {
    httpOnly: false,
    path: "/",
    maxAge: 0,
    sameSite: "lax",
    secure: isProduction
  });
  return res;
}

