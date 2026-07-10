'use server';

import { authenticate, registerUser, setAuthSession } from "@/lib/auth";

export async function loginAction(formData: FormData): Promise<{ id: string; role: string }> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    throw new Error("missing");
  }

  const user = authenticate(email, password);
  if (!user) {
    throw new Error("invalid");
  }

  await setAuthSession(user.id, user.role);
  return { id: user.id, role: user.role };
}

export async function registerAction(formData: FormData): Promise<{ id: string; role: string }> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    throw new Error("missing");
  }

  const user = registerUser(email, password);
  await setAuthSession(user.id, user.role);
  return { id: user.id, role: user.role };
}

