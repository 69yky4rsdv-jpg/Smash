import { getUsers, saveUsers } from "./data";
import type { User } from "./types";
import { randomUUID } from "crypto";
import { cookies } from "next/headers";

export function authenticate(email: string, password: string): User | null {
  const users = getUsers();
  const user = users.find((u) => u.email === email && u.password === password);
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
  const userId = cookieStore.get("vs_userId")?.value ?? "";
  if (!userId) {
    return { user: null, isAdmin: false, hasSubscription: false };
  }
  const users = getUsers();
  const user = users.find((u) => u.id === userId) ?? null;
  const isAdmin = user?.role === "admin";
  const hasSubscription = isAdmin || !!user?.subscriptionPlanId;
  return { user, isAdmin, hasSubscription };
}

