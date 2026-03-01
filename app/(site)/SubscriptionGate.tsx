"use client";

import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
  initialHasAccess?: boolean;
  skipGate?: boolean;
};

/** Gate disabled — always renders children. */
export function SubscriptionGate({ children }: Props) {
  return <>{children}</>;
}
