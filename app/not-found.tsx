import Link from "next/link";
import { CompassIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-[70dvh] w-full max-w-3xl items-center px-4 py-10">
      <Empty className="premium-card border bg-card">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <CompassIcon className="size-4" />
          </EmptyMedia>
          <EmptyTitle>Page not found</EmptyTitle>
          <EmptyDescription>
            The route you opened is not part of this booking workspace.
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Button asChild>
            <Link href="/search">Search flights</Link>
          </Button>
        </EmptyContent>
      </Empty>
    </main>
  );
}
