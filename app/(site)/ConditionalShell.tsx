"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import SiteShell from "./Shell";

const NO_SHELL_PATHS = ["/grid", "/start", "/start/plan"];

type Props = {
  children: ReactNode;
  initialLoggedIn?: boolean;
  initialIsAdmin?: boolean;
};

export function ConditionalShell({ children, initialLoggedIn = false, initialIsAdmin = false }: Props) {
  const pathname = usePathname();
  const noShell = pathname != null && NO_SHELL_PATHS.includes(pathname);
  if (noShell) return <>{children}</>;
  return (
    <SiteShell initialLoggedIn={initialLoggedIn} initialIsAdmin={initialIsAdmin}>
      {children}
    </SiteShell>
  );
}
