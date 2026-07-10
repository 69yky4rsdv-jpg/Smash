import { getUsers, saveUsers } from "./data";
import type { User } from "./types";
import { randomUUID } from "crypto";
import { cookies } from "next/headers";

const AUTH_COOKIE_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

function authCookieOptions() {
  const isProd = process.env.NODE_ENV === "production";
  return {
    path: "/",
    maxAge: AUTH_COOKIE_MAX_AGE,
    sameSite: "lax" as const,
    secure: isProd,
    httpOnly: true,
  };
}

function clearCookieOptions() {
  return { ...authCookieOptions(), maxAge: 0 };
}

/** Persist login across Stripe redirects and browser restarts. */
export async function setAuthSession(userId: string, role: string): Promise<void> {
  const cookieStore = await cookies();
  const opts = authCookieOptions();
  cookieStore.set("vs_userId", userId, opts);
  cookieStore.set("vs_role", role, opts);
}

export async function clearAuthSession(): Promise<void> {
  const cookieStore = await cookies();
  const opts = clearCookieOptions();
  cookieStore.set("vs_userId", "", opts);
  cookieStore.set("vs_role", "", opts);
}

export function authenticate(email: string, password: string): User | null {
  const users = getUsers();
  const normalized = email.trim().toLowerCase();
  const user = users.find(
    (u) => u.email?.toLowerCase() === normalized && u.password === password
  );
  return user ?? null;
}

export function registerUser(email: string, password: string): User {
  const users = getUsers();
  const existing = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  if (existing) {
    throw new Error("Email already in use");
  }
  const user: User = {
    id: randomUUID(),
    email: email.trim(),
    password,
    role: "user"
  };
  users.push(user);
  saveUsers(users);
  return user;
}

export type SessionInfo = {
  user: User | null;
  isAdmin: boolean;
  hasSubscription: boolean;
};

/** Read the current user from cookies and user storage. */
export async function getSession(): Promise<SessionInfo> {
  const cookieStore = await cookies();
  const userId = cookieStore.get("vs_userId")?.value?.trim() ?? "";
  const roleCookie = cookieStore.get("vs_role")?.value?.trim() ?? "";

  if (!userId) {
    return { user: null, isAdmin: false, hasSubscription: false };
  }

  const users = getUsers();
  let user = users.find((u) => u.id === userId) ?? null;
  if (!user && userId === "admin") {
    user = {
      id: "admin",
      email: "admin@velvetstream.test",
      password: "",
      role: "admin",
      subscriptionPlanId: "yearly",
    };
  }

  // Prefer database role; fall back to session role cookie for admin id.
  const isAdmin =
    user?.role === "admin" || (userId === "admin" && roleCookie === "admin");
  const hasSubscription = isAdmin || !!user?.subscriptionPlanId;
  return { user, isAdmin, hasSubscription };
}

