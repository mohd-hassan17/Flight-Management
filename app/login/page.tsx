import { Suspense } from "react";

import LoginClient from "@/components/auth/LoginClient";
import { Skeleton } from "@/components/ui/skeleton";

function LoginFallback() {
  return (
    <main className="flex min-h-dvh items-center justify-center bg-[linear-gradient(135deg,var(--background),var(--muted))] px-4 py-8">
      <div className="w-full max-w-md space-y-6">
        <div className="flex flex-col items-center gap-3">
          <Skeleton className="size-14 rounded-xl" />
          <Skeleton className="h-8 w-36" />
          <Skeleton className="h-4 w-56" />
        </div>
        <Skeleton className="h-[430px] w-full rounded-xl" />
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginFallback />}>
      <LoginClient />
    </Suspense>
  );
}
