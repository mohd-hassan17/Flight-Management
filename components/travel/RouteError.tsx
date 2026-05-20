"use client";

import { AlertTriangleIcon, RotateCwIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export function RouteError({
  title = "Something went wrong",
  description = "The latest flight data could not be loaded.",
  unstable_retry,
}: {
  title?: string;
  description?: string;
  unstable_retry: () => void;
}) {
  return (
    <main className="mx-auto flex min-h-[70dvh] w-full max-w-3xl items-center px-4 py-10">
      <Card className="premium-card w-full">
        <CardContent className="flex flex-col items-center gap-4 p-8 text-center">
          <div className="flex size-12 items-center justify-center rounded-lg bg-destructive/10 text-destructive">
            <AlertTriangleIcon className="size-6" />
          </div>
          <div>
            <h1 className="text-xl font-semibold">{title}</h1>
            <p className="mt-2 text-sm text-muted-foreground">{description}</p>
          </div>
          <Button onClick={unstable_retry} className="gap-2">
            <RotateCwIcon className="size-4" />
            Try again
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}
