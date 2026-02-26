import { NextResponse } from "next/server";
import { authenticate } from "@/lib/auth";

export async function POST(request: Request) {
  const formData = await request.formData();
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");

  const user = authenticate(email, password);

  if (!user) {
    return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set("vs_userId", user.id, {
    httpOnly: false,
    path: "/"
  });

  return res;
}

