"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2Icon, LockKeyholeIcon, MailIcon, PlaneIcon } from "lucide-react";
import { toast } from "sonner";

import { createClient } from "@/lib/supabase/client";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";

export default function LoginClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const redirectTo = searchParams.get("redirectTo") || "/search";

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const { error: authError } = isSignUp
      ? await supabase.auth.signUp({ email, password })
      : await supabase.auth.signInWithPassword({ email, password });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    toast.success(isSignUp ? "Account created" : "Signed in");
    router.push(redirectTo);
    router.refresh();
  }

  return (
    <main className="flex min-h-dvh items-center justify-center bg-[linear-gradient(135deg,var(--background),var(--muted))] px-4 py-8">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <Link
            href="/search"
            className="mx-auto mb-4 flex size-14 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-lg"
            aria-label="FlightApp home"
          >
            <PlaneIcon className="size-7" />
          </Link>
          <h1 className="text-3xl font-semibold">FlightApp</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {isSignUp ? "Create your travel workspace." : "Welcome back to your bookings."}
          </p>
        </div>

        <Card className="premium-card">
          <CardHeader>
            <CardTitle>{isSignUp ? "Create account" : "Sign in"}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit}>
              <FieldGroup>
                <Field>
                  <FieldLabel>Email address</FieldLabel>
                  <div className="relative">
                    <MailIcon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      type="email"
                      required
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      className="h-11 pl-9"
                      placeholder="you@example.com"
                      autoComplete="email"
                    />
                  </div>
                </Field>

                <Field>
                  <FieldLabel>Password</FieldLabel>
                  <div className="relative">
                    <LockKeyholeIcon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      type="password"
                      required
                      minLength={6}
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      className="h-11 pl-9"
                      placeholder="At least 6 characters"
                      autoComplete={isSignUp ? "new-password" : "current-password"}
                    />
                  </div>
                  <FieldDescription>
                    Test account: <span className="font-mono">test@flightapp.com</span> /{" "}
                    <span className="font-mono">Test1234!</span>
                  </FieldDescription>
                </Field>

                {error && (
                  <Alert variant="destructive">
                    <AlertTitle>Authentication failed</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <Button type="submit" className="h-11 w-full gap-2" disabled={loading}>
                  {loading && <Loader2Icon className="size-4 animate-spin" />}
                  {loading ? "Please wait" : isSignUp ? "Create account" : "Sign in"}
                </Button>
              </FieldGroup>
            </form>

            <Separator className="my-6" />

            <p className="text-center text-sm text-muted-foreground">
              {isSignUp ? "Already have an account?" : "New to FlightApp?"}{" "}
              <button
                type="button"
                onClick={() => {
                  setIsSignUp((value) => !value);
                  setError(null);
                }}
                className="font-medium text-primary underline-offset-4 hover:underline"
              >
                {isSignUp ? "Sign in" : "Create an account"}
              </button>
            </p>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
