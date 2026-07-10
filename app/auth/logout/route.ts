import { clearAuthSession } from "@/lib/auth";
import { redirect } from "next/navigation";

export async function GET() {
  await clearAuthSession();
  redirect("/");
}
