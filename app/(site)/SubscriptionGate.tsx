"use client";

import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
  initialHasAccess?: boolean;
  skipGate?: boolean;
};

/**
 * SubscriptionGate has been simplified to a no-op.
 * All pages are now accessible without login or subscription checks.
 */
export function SubscriptionGate({ children }: Props) {
  return <>{children}</>;
}
