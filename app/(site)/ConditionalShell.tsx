"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import SiteShell from "./Shell";

const NO_SHELL_PATHS = ["/grid", "/start", "/start/plan"];

export function ConditionalShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const noShell = pathname != null && NO_SHELL_PATHS.includes(pathname);
  if (noShell) return <>{children}</>;
  return <SiteShell>{children}</SiteShell>;
}
