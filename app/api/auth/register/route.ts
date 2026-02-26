import { NextResponse } from "next/server";
import { registerUser } from "@/lib/auth";

export async function POST(request: Request) {
  const formData = await request.formData();
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");

  try {
    const user = registerUser(email, password);

    const res = NextResponse.json({ ok: true, userId: user.id });
    res.cookies.set("vs_userId", user.id, {
      httpOnly: false,
      path: "/"
    });

    return res;
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ error: "Unable to create account." }, { status: 400 });
  }
}

