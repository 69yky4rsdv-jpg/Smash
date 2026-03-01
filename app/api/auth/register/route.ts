import { NextResponse } from "next/server";
import { registerUser } from "@/lib/auth";

export async function POST(request: Request) {
  const formData = await request.formData();
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");

  try {
    const user = registerUser(email, password);

    const res = NextResponse.json({ ok: true, userId: user.id });
    const isProduction = process.env.NODE_ENV === "production";
    res.cookies.set("vs_userId", user.id, {
      httpOnly: false,
      path: "/",
      sameSite: "lax",
      secure: isProduction,
      maxAge: 60 * 60 * 24 * 365
    });

    return res;
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ error: "Unable to create account." }, { status: 400 });
  }
}

