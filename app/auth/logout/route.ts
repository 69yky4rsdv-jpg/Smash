import { NextResponse } from "next/server";

export async function GET(request: Request) {
  // Redirect back to the current host, so logout works on Render + custom domains.
  const url = new URL("/", request.url);
  const res = NextResponse.redirect(url);
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

