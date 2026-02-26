import { users } from "./data";
import type { User } from "./types";
import { randomUUID } from "crypto";

export function authenticate(email: string, password: string): User | null {
  const user = users.find((u) => u.email === email && u.password === password);
  return user ?? null;
}

export function registerUser(email: string, password: string): User {
  const existing = users.find((u) => u.email === email);
  if (existing) {
    throw new Error("Email already in use");
  }
  const user: User = {
    id: randomUUID(),
    email,
    password,
    role: "user"
  };
  users.push(user);
  return user;
}

