import { getUsers, saveUsers } from "./data";
import type { User } from "./types";
import { randomUUID } from "crypto";

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

