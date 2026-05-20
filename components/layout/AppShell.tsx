"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  CalendarDaysIcon,
  LogInIcon,
  LogOutIcon,
  MenuIcon,
  PlaneIcon,
  SearchIcon,
  TicketCheckIcon,
  UserCircleIcon,
} from "lucide-react";

import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import { useFlightStore } from "@/store/useFlightStore";
import { useUserStore } from "@/store/useUserStore";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

const navItems = [
  { href: "/search", label: "Search", icon: SearchIcon },
  { href: "/my-bookings", label: "My bookings", icon: TicketCheckIcon },
];

function Brand() {
  return (
    <Link href="/search" className="flex items-center gap-2" aria-label="FlightApp home">
      <span className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
        <PlaneIcon className="size-4" />
      </span>
      <span className="font-heading text-base font-semibold">FlightApp</span>
    </Link>
  );
}

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();
  const user = useUserStore((state) => state.user);
  const resetUser = useUserStore((state) => state.reset);
  const resetFlight = useFlightStore((state) => state.reset);

  async function handleLogout() {
    await supabase.auth.signOut();
    resetUser();
    resetFlight();
    router.push("/login");
    router.refresh();
  }

  if (pathname === "/login") {
    return <>{children}</>;
  }

  return (
    <div className="min-h-dvh bg-[linear-gradient(180deg,var(--background),var(--muted)_42%,var(--background))]">
      <header className="sticky top-0 z-40 border-b border-border/70 bg-background/82 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Brand />

          <nav className="hidden items-center gap-1 md:flex" aria-label="Main navigation">
            {navItems.map((item) => {
              if (item.href === "/my-bookings" && !user) return null;

              const Icon = item.icon;
              const active = pathname === item.href || pathname?.startsWith(`${item.href}/`);

              return (
                <Button
                  key={item.href}
                  asChild
                  variant={active ? "secondary" : "ghost"}
                  className={cn("gap-2", active && "bg-primary/8 text-primary hover:bg-primary/10")}
                >
                  <Link href={item.href}>
                    <Icon className="size-4" />
                    {item.label}
                  </Link>
                </Button>
              );
            })}
          </nav>

          <div className="hidden items-center gap-2 md:flex">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="gap-2">
                    <UserCircleIcon className="size-4" />
                    <span className="max-w-44 truncate">{user.email}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-64">
                  <DropdownMenuLabel>
                    <span className="block text-foreground">Signed in</span>
                    <span className="block truncate font-normal text-muted-foreground">
                      {user.email}
                    </span>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/my-bookings">
                      <CalendarDaysIcon className="size-4" />
                      Manage bookings
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem variant="destructive" onClick={handleLogout}>
                    <LogOutIcon className="size-4" />
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button asChild>
                <Link href="/login">
                  <LogInIcon className="size-4" />
                  Sign in
                </Link>
              </Button>
            )}
          </div>

          <div className="md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon">
                  <MenuIcon className="size-4" />
                  <span className="sr-only">Open menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[86vw] max-w-sm">
                <SheetHeader>
                  <SheetTitle>
                    <Brand />
                  </SheetTitle>
                </SheetHeader>
                <div className="flex flex-1 flex-col gap-2 px-4">
                  {navItems.map((item) => {
                    if (item.href === "/my-bookings" && !user) return null;
                    const Icon = item.icon;

                    return (
                      <SheetClose asChild key={item.href}>
                        <Button asChild variant="ghost" className="justify-start gap-2">
                          <Link href={item.href}>
                            <Icon className="size-4" />
                            {item.label}
                          </Link>
                        </Button>
                      </SheetClose>
                    );
                  })}
                  <Separator className="my-2" />
                  {user ? (
                    <>
                      <div className="rounded-lg border bg-card p-3 text-sm">
                        <p className="font-medium">Signed in</p>
                        <p className="truncate text-muted-foreground">{user.email}</p>
                      </div>
                      <Button variant="destructive" className="justify-start gap-2" onClick={handleLogout}>
                        <LogOutIcon className="size-4" />
                        Sign out
                      </Button>
                    </>
                  ) : (
                    <SheetClose asChild>
                      <Button asChild className="justify-start gap-2">
                        <Link href="/login">
                          <LogInIcon className="size-4" />
                          Sign in
                        </Link>
                      </Button>
                    </SheetClose>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>
      {children}
    </div>
  );
}
