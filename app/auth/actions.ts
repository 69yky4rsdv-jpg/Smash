'use server';

import { redirect } from "next/navigation";
import { readNextPath, isRedirectError } from "@/lib/action-errors";
import { authenticate, registerUser, setAuthSession } from "@/lib/auth";

export async function loginAction(formData: FormData): Promise<void> {
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
  redirect(readNextPath(formData));
}

export async function registerAction(formData: FormData): Promise<void> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    throw new Error("missing");
  }

  const user = registerUser(email, password);
  await setAuthSession(user.id, user.role);
  redirect("/pricing");
}

export { isRedirectError };
