import { Suspense } from "react";
import LoginForm from "./LoginForm";

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="mx-auto max-w-md px-4 py-10 text-sm text-neutral-400">Loading…</div>}>
      <LoginForm />
    </Suspense>
  );
}
